package controllers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

type ReportController struct{}

func UploadFileHelper(fileHeader *multipart.FileHeader, folder string) (string, error) {
	if fileHeader == nil {
		return "", nil
	}

	// สร้างชื่อไฟล์ไม่ให้ซ้ำ
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(fileHeader.Filename))
	uploadPath := filepath.Join("./uploads/reports", folder)

	// สร้างโฟลเดอร์ถ้าไม่พบ
	if _, err := os.Stat(uploadPath); os.IsNotExist(err) {
		if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
			return "", err
		}
	}

	fullPath := filepath.Join(uploadPath, filename)

	// บันทึกไฟล์
	if err := saveUploadedFile(fileHeader, fullPath); err != nil {
		return "", err
	}

	// คืนค่า URL สำหรับเรียกใช้งานจาก frontend
	fileURL := fmt.Sprintf("/uploads/reports/%s/%s", folder, filename)
	return fileURL, nil
}

// saveUploadedFile - wrapper สำหรับ c.SaveUploadedFile() เวลาที่เราไม่มี *gin.Context
func saveUploadedFile(fileHeader *multipart.FileHeader, fullPath string) error {
	src, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}

type CreateReportRequest struct {
	Topic        string `json:"topic" binding:"required"`
	Description  string `json:"description" binding:"required"`
	ReportTypeID uint   `json:"report_type_id" binding:"required"`
	// Photo จะมาจาก multipart/form-data
}

// GetReportTypes - ดึงประเภทรายงานทั้งหมด
func (rc *ReportController) GetReportTypes(c *gin.Context) {
	db := connection.DB()
	var reportTypes []entity.ReportType

	if err := db.Find(&reportTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงประเภทรายงานได้"})
		return
	}

	c.JSON(http.StatusOK, reportTypes)
}

// CreateReport - สร้างรายงานใหม่
func (rc *ReportController) CreateReport(c *gin.Context) {
	db := connection.DB()
	uidStr := c.Param("user_id")
	uid, err := strconv.Atoi(uidStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}
	// ดึง user ID จาก JWT token
	// userIDInterface, exists := c.Get("userID")
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
	// 	return
	// }

	// userID, ok := userIDInterface.(uint)
	// if !ok {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "ข้อมูลผู้ใช้ไม่ถูกต้อง"})
	// 	return
	// }

	// รับข้อมูลจาก multipart form
	topic := c.PostForm("topic")
	description := c.PostForm("description")
	reportTypeIDStr := c.PostForm("report_type_id")

	if topic == "" || description == "" || reportTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วน"})
		return
	}

	reportTypeID, err := strconv.ParseUint(reportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ประเภทรายงานไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบว่า ReportType มีอยู่จริง
	var reportType entity.ReportType
	if err := db.First(&reportType, uint(reportTypeID)).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบประเภทรายงานที่เลือก"})
		return
	}

	// จัดการไฟล์รูปภาพ (ถ้ามี)
	header, err := c.FormFile("photo")
	var photoPath string
	if err == nil && header != nil {
		uploadedURL, err := UploadFileHelper(header, "reports")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
			return
		}
		photoPath = uploadedURL
	}
	// สร้าง Report ใหม่
	report := entity.Report{
		Topic:          topic,
		Description:    description,
		Photo:          photoPath,
		UserID:         uint(uid),
		ReportStatusID: 1, 
		ReportTypeID:   uint(reportTypeID),
	}

	if err := db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกรายงานได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "สร้างรายงานสำเร็จ",
		"report_id": report.ID,
	})
}
