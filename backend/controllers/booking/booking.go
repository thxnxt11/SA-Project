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

type CreateBookingReq struct {
	// หมายเหตุ: ถ้าอยากบังคับให้ใช้ user จาก JWT เท่านั้น ให้ลบ field นี้ออก
	UserID          *uint   `json:"user_id,omitempty"`
	ShowDateID      uint    `json:"showdate_id"        binding:"required"`
	ZoneID          uint    `json:"zone_id"            binding:"required"`
	SeatIDs         []uint  `json:"seat_ids"`                     // seating: ใส่ seat_ids; standing: เว้นว่าง
	QueueNumber     int     `json:"queue_number"`                 // standing: ใช้คิว; seating: 0 ได้
	TotalPrice      int     `json:"total_price"       binding:"required"`
	BookingStatusID uint    `json:"booking_status_id"  binding:"required"` // 1=pending ฯลฯ
	HoldMinutes     int     `json:"hold_minutes"`                 // เช่น 15 นาทีสำหรับ hold
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req CreateBookingReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body: " + err.Error()})
		return
	}

	var userID uint
	if req.UserID != nil {
		userID = *req.UserID
	}
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user_id"})
		return
	}

	in := services.CreateBookingInput{
		UserID:          userID,
		ShowDateID:      req.ShowDateID,
		ZoneID:          req.ZoneID,
		SeatIDs:         req.SeatIDs,
		QueueNumber:     req.QueueNumber,
		TotalPrice:      req.TotalPrice,
		BookingStatusID: req.BookingStatusID,
		HoldMinutes:     req.HoldMinutes,
	}

	booking, err := h.bookingService.CreateBooking(in)
	if err != nil {
		switch err {
		case services.ErrSeatNotFound:
			c.JSON(http.StatusBadRequest, gin.H{"error": "one or more seats not found in this zone/showdate"})
			return
		case services.ErrSeatAlreadyTaken:
			c.JSON(http.StatusConflict, gin.H{"error": "one or more seats already taken"})
			return
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "booking created",
		"data":    booking,
	})
}


