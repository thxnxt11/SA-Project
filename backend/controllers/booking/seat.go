package booking

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/services"
)

type BookingHandler struct {
	bookingService *services.BookingService
}

func NewBookingHandler() *BookingHandler {
	return &BookingHandler{
		bookingService: services.NewBookingService(),
	}
}

// Controller Layer: จัดการ HTTP Request/Response เท่านั้น
func (h *BookingHandler) GetSeatByZoneID(c *gin.Context) {
	// 1. รับและ validate input
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ZoneID"})
		return
	}

	// 2. เรียกใช้ business logic จาก service
	seats, err := h.bookingService.GetSeatsByZoneID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3. ส่งผลลัพธ์กลับ
	c.JSON(http.StatusOK, seats)
}