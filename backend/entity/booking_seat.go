package entity

import (
	"gorm.io/gorm"
)

type BookingSeat struct {
	gorm.Model
	BookingID uint `json:"booking_id"`
	Booking *Booking `gorm:"foreignKey:BookingID"`
	SeatID    uint `json:"seat_id"`
	Seat    *Seat    `gorm:"foreignKey:SeatID"`
}