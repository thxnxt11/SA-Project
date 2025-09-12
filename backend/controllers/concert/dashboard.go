package concert

import (
	"net/http"
	"strconv"


	"github.com/gin-gonic/gin"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)



// GET /payments?booking_id=123
// GET /payments?booking_id=123
func GetAllPayments(c *gin.Context) {
	db := connection.DB()

	var payments []entity.Payment

	if bidStr := c.Query("booking_id"); bidStr != "" {
		bid, err := strconv.Atoi(bidStr)
		if err != nil || bid <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid booking_id"})
			return
		}
		if err := db.
			Model(&entity.Payment{}).
			Preload("Booking").
			Preload("Promotion").
			Preload("PaymentMethod").
			Preload("PaymentStatus").
			Where("booking_id = ?", bid).
			Where("payment_status_id = ?", 2). // only paid

			Find(&payments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, payments)
		return
	}

	// no booking_id -> return all payments with status = 2
	if err := db.
		Model(&entity.Payment{}).
		Preload("Booking").
		Preload("Promotion").
		Preload("PaymentMethod").
		Preload("PaymentStatus").
		Where("payment_status_id = ?", 2). // only paid

		Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}