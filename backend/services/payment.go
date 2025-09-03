package services

import (
	"errors"
	"time"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type PaymentService struct {
	DB *gorm.DB
}

func NewPaymentService() *PaymentService {
	return &PaymentService{
		DB: connection.DB(),
	}
}

type CreatePaymentInput struct {
	BookingID       uint
	PromotionID     *uint
	RefundTypeID    *uint
	PaymentMethodID uint

	BasePrice  float32
	Discount   float32
	RefundFee  int
	TotalPrice *float32 // ถ้าไม่ส่ง จะคำนวณ = base - discount + refund_fee
}

func CalculateTotalPrice(base, discount, refundFee float32) float32 {
	return base - discount + refundFee
}

func zeroIfNil(u *uint) uint {
	if u == nil {
		return 0
	}
	return *u
}

func (s *PaymentService) CreatePayment(in CreatePaymentInput) (*entity.Payment, error) {
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	
	// ใช้ defer เพื่อจัดการ rollback อัตโนมัติ
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var booking entity.Booking
	if err := tx.First(&booking, in.BookingID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("booking not found")
	}
	if booking.BookingStatusID == 4 {
		tx.Rollback()
		return nil, errors.New("cannot create payment: booking already expired")
	}

	var method entity.PaymentMethod
	if err := tx.First(&method, in.PaymentMethodID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("payment method not found")
	}

	if in.RefundTypeID != nil && in.RefundFee == 0 {
		var refundType entity.RefundType
		if err := tx.First(&refundType, *in.RefundTypeID).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("refund type not found")
		}
		in.RefundFee = refundType.RefundFee
	}

	var totalPrice float32
	if in.TotalPrice != nil {
		totalPrice = *in.TotalPrice
	} else {
		totalPrice = CalculateTotalPrice(in.BasePrice, in.Discount, float32(in.RefundFee))
	}

	statusID := uint(1) // สมมติ ID 1 คือ 'pending payment'

	pay := entity.Payment{
		BookingID:       in.BookingID,
		PromotionID:     zeroIfNil(in.PromotionID),
		RefundTypeID:    zeroIfNil(in.RefundTypeID),
		BasePrice:       in.BasePrice,
		Discount:        in.Discount,
		RefundFee:       float32(in.RefundFee),
		TotalPrice:      totalPrice,
		PaymentMethodID: in.PaymentMethodID,
		PaymentStatusID: statusID,
	}
	
	if err := tx.Create(&pay).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if in.PromotionID != nil && *in.PromotionID > 0 {
		result := tx.Model(&entity.Promotion{}).
			Where("id = ?", *in.PromotionID).
			UpdateColumn("used_count", gorm.Expr("used_count + ?", 1))
		
		if result.Error != nil {
			tx.Rollback()
			return nil, result.Error
		}
		
		// ตรวจสอบว่า promotion มีอยู่จริงหรือไม่
		if result.RowsAffected == 0 {
			tx.Rollback()
			return nil, errors.New("promotion not found")
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// ดึงข้อมูล payment พร้อม preload (ใช้ s.DB ปกติ เพราะ tx ถูก commit แล้ว)
	var createdpayment entity.Payment
	if err := s.DB.
		Preload("Booking").
		Preload("Promotion").
		Preload("RefundType").
		Preload("PaymentMethod").
		Preload("PaymentStatus").
		First(&createdpayment, pay.ID).Error; err != nil {
		return &pay, err
	}

	return &createdpayment, nil
}

func (s *PaymentService) UpdatePaymentStatusToPaid(id uint) (*entity.Payment, error) {
	var p entity.Payment
	if err := s.DB.First(&p, id).Error; err != nil {
		return nil, err
	}
	if err := s.DB.Model(&p).Updates(map[string]interface{}{
		"payment_status_id": 2,
		"paid_at": time.Now(),
	}).Error; err != nil {
		return nil, err
	}
	bookingSvc := NewBookingService()
    if err := bookingSvc.OnPaymentPaid(p.BookingID); err != nil {
        return &p, err
    }

    return &p, nil
}