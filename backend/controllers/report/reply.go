package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
)

// รับ user_id และ role_id จาก request body
type ReplyRequest struct {
	Message string `json:"message" binding:"required"`
	UserID  uint   `json:"user_id" binding:"required"`
	RoleID  int    `json:"role_id" binding:"required"`
}

func ReplyReport(c *gin.Context) {
	db := connection.DB()

	reportIDStr := c.Param("report_id")
	reportID, err := strconv.Atoi(reportIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "report_id ไม่ถูกต้อง"})
		return
	}

	var req ReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อความและ user info"})
		return
	}

	// ตรวจสอบว่าเป็น admin
	if req.RoleID != 3 {
		c.JSON(http.StatusForbidden, gin.H{"error": "เฉพาะ admin ตอบกลับได้"})
		return
	}

	// ตรวจสอบว่า report มีอยู่จริง
	var report entity.Report
	if err := db.Preload("User").First(&report, reportID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบรายงาน"})
		return
	}

	// สร้าง reply
	reply := entity.ReportReply{
		ReportID: uint(reportID),
		AdminID:  req.UserID,
		Message:  req.Message,
	}

	if err := db.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อความตอบกลับได้"})
		return
	}

	// เปลี่ยนสถานะของ report จาก 1 → 2
	report.ReportStatusID = 2
	if err := db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตสถานะรายงานได้"})
		return
	}

	// ส่ง email ไปผู้ใช้
	emailService := services.NewEmailService()
	subject := "หัวข้อ: " + report.Topic
	body := "Admin ตอบกลับรายงานของคุณ:\n\n" + req.Message
	if err := emailService.SendEmail(report.User.Email, subject, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ส่ง email ไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ตอบกลับสำเร็จ, ส่ง email เรียบร้อย และเปลี่ยนสถานะเป็น 2 แล้ว"})
}
