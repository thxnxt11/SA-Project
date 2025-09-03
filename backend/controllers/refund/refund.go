package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

type PaymentInfo struct {
	ID         uint    `json:"id"`
	TotalPrice float32 `json:"totalprice"`
	Status     string  `json:"status"`
}

// struct สำหรับ response
type BookingInfo struct {
	ID           uint      `json:"id"`
	BookingCode  string    `json:"booking_code"`
	CreatedAt    time.Time `json:"created_at"`
	RefundTypeID uint      `json:"refund_type_id"`
	CanRefund    bool      `json:"can_refund"`
	Payment      struct {
		TotalPrice float32 `json:"totalprice"`
		Status     string  `json:"status"`
	} `json:"payment"`
}

type RefundRequest struct {
	BookingCode string `json:"booking_code"`
	Reason      string `json:"reason"`
	BankNumber  string `json:"bank_number"`
	BankID      uint   `json:"bank_id"`
}

type RefundController struct{}

// ✅ GetUserBookings – ดึงการจอง + payment ของ user// ✅ GetUserBookings – ดึงการจอง + payment ของ user
func (rc *RefundController) GetUserBookings(c *gin.Context) {
	db := connection.DB()
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}

	var bookings []entity.Booking
	if err := db.
		Preload("BookingStatus").
		Preload("ShowDate").
		Where("user_id = ?", userID).
		Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
		return
	}

	var bookingInfos []BookingInfo
	for _, booking := range bookings {
		var payment entity.Payment
		if err := db.
			Where("booking_id = ?", booking.ID).
			Preload("PaymentStatus").
			First(&payment).Error; err != nil {
			bookingInfos = append(bookingInfos, BookingInfo{
				ID:          booking.ID,
				BookingCode: booking.BookingCode,
				CreatedAt:   booking.CreatedAt,
				CanRefund:   false,
				Payment: struct {
					TotalPrice float32 `json:"totalprice"`
					Status     string  `json:"status"`
				}{},
			})
			continue
		}

		// ตรวจสอบ refund
		canRefund := rc.canBookingBeRefunded(booking, &payment)

		bookingInfos = append(bookingInfos, BookingInfo{
			ID:           booking.ID,
			BookingCode:  booking.BookingCode,
			CreatedAt:    booking.CreatedAt,
			RefundTypeID: payment.RefundTypeID,
			CanRefund:    canRefund,
			Payment: struct {
				TotalPrice float32 `json:"totalprice"`
				Status     string  `json:"status"`
			}{
				TotalPrice: payment.TotalPrice,
				Status:     payment.PaymentStatus.PaymentStatus,
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookingInfos})
}

// ✅ GetBankOptions – ดึงธนาคารทั้งหมด
func (rc *RefundController) GetBankOptions(c *gin.Context) {
	db := connection.DB()

	var banks []entity.Bank
	if err := db.Find(&banks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลธนาคารได้"})
		return
	}

	// ส่งตรงๆ เป็น JSON ที่มี id และ bank_name
	c.JSON(http.StatusOK, gin.H{"banks": banks})
}


// ✅ CreateRefund – สร้างคำขอคืนเงิน
func (rc *RefundController) CreateRefund(c *gin.Context) {
	db := connection.DB()
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}

	var req RefundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง: " + err.Error()})
		return
	}

	// หา Booking
	var booking entity.Booking
	if err := db.Preload("BookingStatus").
		Preload("ShowDate").
		Where("booking_code = ? AND user_id = ?", req.BookingCode, userID).
		First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการจองที่ระบุ"})
		return
	}

	// หา Payment จาก BookingID
	var payment entity.Payment
	if err := db.
		Where("booking_id = ?", booking.ID).
		Preload("PaymentStatus").
		First(&payment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบข้อมูลการชำระเงิน"})
		return
	}

	// ตรวจสอบว่า refund ได้ไหม
	if !rc.canBookingBeRefunded(booking, &payment) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "การจองนี้ไม่สามารถขอคืนเงินได้"})
		return
	}

	// ตรวจสอบธนาคาร
	var bank entity.Bank
	if err := db.First(&bank, req.BankID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบธนาคารที่เลือก"})
		return
	}

	// หา RefundStatus เริ่มต้น
	var refundStatus entity.RefundStatus
	if err := db.Where("status_name = ? OR id = ?", "รอดำเนินการ", 1).First(&refundStatus).Error; err != nil {
		refundStatus.ID = 1
	}

	// สร้าง Refund
	refund := entity.Refund{
		Reason:         req.Reason,
		Bank_number:    req.BankNumber,
		UserID:         uint(userID),
		BookingID:      booking.ID,
		RefundStatusID: refundStatus.ID,
		PaymentID:      payment.ID,
		BankID:         req.BankID,
	}

	if err := db.Create(&refund).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกคำขอคืนเงินได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "ส่งคำขอคืนเงินสำเร็จ",
		"refund_id": refund.ID,
	})
}

// ✅ ฟังก์ชันตรวจสอบ refund ได้ไหม
func (rc *RefundController) canBookingBeRefunded(booking entity.Booking, payment *entity.Payment) bool {
	// BookingStatus
	if booking.BookingStatus != nil {
		status := booking.BookingStatus.BookingStatus
		if status == "cancelled" || status == "expired" {
			return false
		}
	}

	// PaymentStatus
	if payment != nil && payment.PaymentStatus != nil {
		if payment.PaymentStatus.PaymentStatus != "paided" {
			return false
		}
	}

	return true
}
