// controllers/refund_controller.go
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

// GET /api/refunds/history/:user_id
func GetRefundHistory(c *gin.Context) {
	userID := c.Param("user_id")

	var refunds []entity.Refund
	if err := connection.DB().
		Preload("User").
		Preload("Booking").
		Preload("RefundStatus").
		Preload("Payment").
		Preload("Bank").
		Where("user_id = ?", userID).
		Find(&refunds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, refunds)
}
