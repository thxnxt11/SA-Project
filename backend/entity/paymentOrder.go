package entity

import (
	"time"

	"gorm.io/gorm"
)

type PaymentOrder struct {
   gorm.Model
   CartID      uint           `json:"cart_id"`
   Cart        *Cart          `gorm:"foreignKey:CartID" json:"cart"`

   PromotionID *uint           `json:"promotion_id"`
   Promotion   *Promotion     `gorm:"foreignKey:PromotionID" json:"promotion"`

   BasePrice   float32        `json:"base_price"`
   Discount    float32        `json:"discount"`
   TotalPrice  float32        `json:"total_price"`

   StatusID    uint           `json:"status_id"`
   Status      *PaymentStatus `gorm:"foreignKey:StatusID" json:"status"`

   MethodID    *uint           `json:"method_id"`
   Method      *PaymentMethod `gorm:"foreignKey:MethodID" json:"method"`

   PaidAt      *time.Time      `json:"paid_at"`
	ReceiptURL  string         `json:"receipt_url"`
}
