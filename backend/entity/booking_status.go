package entity

import (
	"gorm.io/gorm"
)

type BookingStatus struct {
	gorm.Model
	BookingStatus string `gorm:"type:text" json:"booking_status"`
	// Enum('pending','paid','cancelled','expired','refunded')
}