package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	BookingID uint `gorm:"uniqueIndex" json:"booking_id"`
	Booking *Booking `gorm:"foreignKey:BookingID" json:"booking"`
	PromotionID uint `json:"promotion_id"`
	Promotion *Promotion `gorm:"foreignKey:PromotionID" json:"promotion"`
	RefundTypeID uint `json:"refund_type_id"`
	RefundType *RefundType `gorm:"foreignKey:RefundTypeID" json:"refund_type"`
	BasePrice float32 `json:"base_price"`
	Discount  float32 `json:"discount"`
	RefundFee float32 `json:"refund_fee"`
	TotalPrice float32 `json:"total_price"`
	PaymentMethodID uint `json:"payment_method_id"`
	PaymentMethod *PaymentMethod `gorm:"foreignKey:PaymentMethodID" json:"payment_method"`
	PaymentStatusID uint `json:"payment_status_id"`
	PaymentStatus *PaymentStatus `gorm:"foreignKey:PaymentStatusID" json:"payment_status"`
	PaidAt time.Time `json:"paid_at"`
	ReceiptURL string `json:"receipt_url"`
}
