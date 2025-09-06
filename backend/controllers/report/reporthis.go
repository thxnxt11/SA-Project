package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

func GetReportHistory(c *gin.Context) {
    userID := c.Param("user_id")

    var reports []entity.Report
    if err := connection.DB().
        Preload("User").
        Preload("ReportType").
        Preload("ReportStatus").
        Where("user_id = ?", userID).
        Find(&reports).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, reports)
}
