package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

type PaymentInfo struct {
	ID        uint    `json:"id"`
	BasePrice float32 `json:"base_price"`
	Status    string  `json:"status"`
}

// struct สำหรับ response
type BookingInfo struct {
	ID           uint      `json:"id"`
	BookingCode  string    `json:"booking_code"`
	CreatedAt    time.Time `json:"created_at"`
	RefundTypeID uint      `json:"refund_type_id"`
	CanRefund    bool      `json:"can_refund"`
	Payment      struct {
		BasePrice float32 `json:"base_price"`
		Status    string  `json:"status"`
	} `json:"payment"`
}

type RefundRequest struct {
	BookingCode string `json:"booking_code"`
	Reason      string `json:"reason"`
	BankNumber  string `json:"bank_number"`
	BankID      uint   `json:"bank_id"`
}

// struct สำหรับ dropdown booking codes
type RefundableBooking struct {
	BookingCode string `json:"booking_code"`
	BookingID   uint   `json:"booking_id"`
}

type RefundController struct{}

// ✅ GetRefundableBookings – ดึง booking_code ที่สามารถ refund ได้ (refund_type_id = 2)
func (rc *RefundController) GetRefundableBookings(c *gin.Context) {
	db := connection.DB()
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}

	var bookings []entity.Booking
	if err := db.Where("user_id = ?", userID).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลการจองได้"})
		return
	}

	refundableBookings := []RefundableBooking{}

	for _, booking := range bookings {
		fmt.Println("Checking booking:", booking.BookingCode)

		// เช็คว่ามี refund แล้วหรือยัง
		var existingRefund entity.Refund
		if err := db.Where("booking_id = ?", booking.ID).First(&existingRefund).Error; err == nil {
			fmt.Println("  ❌ Booking already has a refund:", booking.BookingCode)
			continue // ถ้ามี refund แล้ว ข้ามไป
		}

		var payment entity.Payment
		if err := db.Where("booking_id = ?", booking.ID).First(&payment).Error; err != nil {
			fmt.Println("  ❌ No payment for booking:", booking.BookingCode)
			continue
		}

		fmt.Println("  Payment found. RefundTypeID:", payment.RefundTypeID)

		if payment.RefundTypeID != 2 {
			fmt.Println("  ❌ RefundTypeID is not 2, skip booking:", booking.BookingCode)
			continue
		}

		if !rc.canBookingBeRefunded(booking, &payment) {
			fmt.Println("  ❌ Booking cannot be refunded due to status:", booking.BookingCode)
			continue
		}

		refundableBookings = append(refundableBookings, RefundableBooking{
			BookingCode: booking.BookingCode,
			BookingID:   booking.ID,
		})
		fmt.Println("  ✅ Booking added to refundable list:", booking.BookingCode)
	}

	if refundableBookings == nil {
		refundableBookings = []RefundableBooking{}
	}

	c.JSON(http.StatusOK, gin.H{
		"refundable_bookings": refundableBookings,
		"count":               len(refundableBookings),
	})
}

// ✅ GetUserBookings – ดึงการจอง + payment ของ user
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
					BasePrice float32 `json:"base_price"`
					Status    string  `json:"status"`
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
				BasePrice float32 `json:"base_price"`
				Status    string  `json:"status"`
			}{
				BasePrice: payment.BasePrice,
				Status:    payment.PaymentStatus.PaymentStatus,
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

	// แปลงเป็น DTO ที่ frontend ต้องใช้
	var result []gin.H
	for _, b := range banks {
		result = append(result, gin.H{
			"id":        b.ID,
			"bank_name": b.Bank_Name,
		})
	}

	c.JSON(http.StatusOK, gin.H{"banks": result})
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

	// เช็คว่า refund_type_id = 2 หรือไม่
	if payment.RefundTypeID != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "การจองนี้ไม่สามารถขอคืนเงินได้ เนื่องจากประเภทการคืนเงินไม่อนุญาต"})
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

	refundAmount := payment.BasePrice - payment.Discount

	// สร้าง Refund
	refund := entity.Refund{
		Reason:         req.Reason,
		Bank_number:    req.BankNumber,
		UserID:         uint(userID),
		BookingID:      booking.ID,
		RefundStatusID: refundStatus.ID,
		PaymentID:      payment.ID,
		BankID:         req.BankID,
		Amount:         refundAmount,
	}

	if err := db.Create(&refund).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกคำขอคืนเงินได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "ส่งคำขอคืนเงินสำเร็จ",
		"refund_id": refund.ID,
		"amount":    refund.Amount,
	})
}

// ✅ ฟังก์ชันตรวจสอบ refund ได้ไหม
func (rc *RefundController) canBookingBeRefunded(booking entity.Booking, payment *entity.Payment) bool {
	// BookingStatus
	if booking.BookingStatus != nil {
		status := booking.BookingStatus.BookingStatus
		if status != "paided" {
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

// DELETE /api/refunds/:id
func DeleteRefund(c *gin.Context) {
	id := c.Param("id")
	userID := c.Param("user_id")

	var user entity.User
	if err := connection.DB().First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// ✅ อนุญาตให้ลบได้เฉพาะ role == 2
	if user.RoleID != 2 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only role 2 is allowed to delete refunds"})
		return
	}

	var refund entity.Refund
	if err := connection.DB().First(&refund, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Refund not found"})
		return
	}

	if err := connection.DB().Delete(&refund).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Refund deleted successfully"})
}

func UpdateRefundStatus(c *gin.Context) {
    refundID := c.Param("id")

    var req struct {
        RefundStatusID uint `json:"refund_status_id"`
        RequesterID    uint `json:"requester_id"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // เช็ค requester role
    var requester entity.User
    if err := connection.DB().First(&requester, req.RequesterID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้ที่ร้องขอ"})
        return
    }

    if requester.RoleID != 3 {
        c.JSON(http.StatusForbidden, gin.H{"error": "ไม่มีสิทธิ์ในการอัปเดตสถานะ"})
        return
    }

    if err := connection.DB().Model(&entity.Refund{}).
        Where("id = ?", refundID).
        Update("refund_status_id", req.RefundStatusID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Refund status updated successfully"})
}