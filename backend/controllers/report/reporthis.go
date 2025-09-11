package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

func GetReportHistory(c *gin.Context) {
	userID := c.Param("user_id")
	requesterID, err := strconv.Atoi(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	// โหลด requester เพื่อเช็ก role
	var requester entity.User
	if err := connection.DB().First(&requester, requesterID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้ที่ร้องขอ"})
		return
	}
	var reports []entity.Report
	query := connection.DB().
		Preload("User").
		Preload("ReportType").
		Preload("ReportStatus")

	if requester.RoleID != 3 { // ถ้าไม่ใช่ role==3 ให้กรองเฉพาะของตัวเอง
		query = query.Where("user_id = ?", requesterID)
	}

	if err := query.Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reports)
}