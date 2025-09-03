package controllers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

// GET /api/report-types
func GetReportTypes(c *gin.Context) {
	var reportTypes []entity.ReportType
	if err := connection.DB().Find(&reportTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reportTypes)
}

// GET /api/report-status
func GetReportStatus(c *gin.Context) {
	var reportStatuses []entity.ReportStatus
	if err := connection.DB().Find(&reportStatuses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reportStatuses)
}

// POST /api/reports
func CreateReport(c *gin.Context) {
	// รับค่าจาก multipart form
	topic := c.PostForm("topic")
	description := c.PostForm("description")
	reportTypeIDStr := c.PostForm("report_type_id")
	membersIDStr := c.PostForm("members_id")

	// Validation
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Topic is required"})
		return
	}
	if description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Description is required"})
		return
	}
	if reportTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Report type ID is required"})
		return
	}

	// แปลง string เป็น uint
	reportTypeID, err := strconv.ParseUint(reportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report type ID"})
		return
	}

	var membersID uint = 0
	if membersIDStr != "" {
		memberID, err := strconv.ParseUint(membersIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid members ID"})
			return
		}
		membersID = uint(memberID)
	}

	// ถ้าไม่ได้ส่ง membersID ให้ใช้ default
	if membersID == 0 {
		var firstMember entity.Members
		connection.DB().First(&firstMember)
		membersID = firstMember.ID
	}

	// จัดการไฟล์รูป
	var photoPath string
	file, header, err := c.Request.FormFile("photo")
	if err == nil && file != nil {
		defer file.Close()

		// สร้างชื่อไฟล์ใหม่
		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("report_%d_%d%s", membersID, time.Now().Unix(), ext)
		
		// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
		uploadsDir := "uploads/reports"
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		// บันทึกไฟล์
		photoPath = filepath.Join(uploadsDir, filename)
		dst, err := os.Create(photoPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
			return
		}
		defer dst.Close()

		if _, err = io.Copy(dst, file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
	}

	report := entity.Report{
		Topic:          topic,
		Description:    description,
		Photo:          photoPath, // เก็บ path ของไฟล์แทน base64
		MembersID:      membersID,
		ReportTypeID:   uint(reportTypeID),
		ReportStatusID: 1, // รอการตอบกลับ
	}

	if err := connection.DB().Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// โหลดความสัมพันธ์
	connection.DB().Preload("Members").Preload("ReportType").Preload("ReportStatus").First(&report, report.ID)
	c.JSON(http.StatusCreated, report)
}

// GET /api/reports
func GetReports(c *gin.Context) {
	var reports []entity.Report
	if err := connection.DB().Preload("Members").Preload("ReportType").Preload("ReportStatus").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// GET /api/reports/:id
func GetReport(c *gin.Context) {
	id := c.Param("id")
	var report entity.Report

	if err := connection.DB().Preload("Members").Preload("ReportType").Preload("ReportStatus").First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GET /api/uploads/reports/:filename - สำหรับดูรูปภาพ
func ServeReportImage(c *gin.Context) {
	filename := c.Param("filename")
	filePath := filepath.Join("uploads/reports", filename)
	
	// ตรวจสอบว่าไฟล์มีอยู่จริง
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}
	
	c.File(filePath)
}

// PUT /api/reports/:id/status
func UpdateReportStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		StatusID uint `json:"status_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var report entity.Report
	if err := connection.DB().First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	report.ReportStatusID = req.StatusID
	if err := connection.DB().Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Load relationships
	connection.DB().Preload("Members").Preload("ReportType").Preload("ReportStatus").First(&report, report.ID)

	c.JSON(http.StatusOK, report)
}

// DELETE /api/reports/:id
func DeleteReport(c *gin.Context) {
	id := c.Param("id")

	// ดึงข้อมูลรายงานก่อนลบเพื่อลบไฟล์รูปด้วย
	var report entity.Report
	if err := connection.DB().First(&report, id).Error; err == nil {
		// ลบไฟล์รูปถ้ามี
		if report.Photo != "" {
			os.Remove(report.Photo)
		}
	}

	if err := connection.DB().Delete(&entity.Report{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report deleted successfully"})
}