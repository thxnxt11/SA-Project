package entity

import (
	"gorm.io/gorm"
)

type PaymentStatus struct {
	gorm.Model
	PaymentStatus string `gorm:"type:text" json:"paymenstatus"`
	// Enum('pending payment', 'paid', 'cancelled','refunded','expired');default:'pending'
}