package entity

import (
	"gorm.io/gorm"
)

type BookingStatus struct {
	gorm.Model
	BookingStatus string `gorm:"type:text" json:"booking_status"`
	// Enum('reserved','awaiting_payment','paid','cancelled','expired','refunded')
}