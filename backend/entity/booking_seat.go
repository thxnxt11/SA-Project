package entity

import (
	"gorm.io/gorm"
)

type BookingSeat struct {
	gorm.Model
	BookingID uint `gorm:"uniqueIndex:idx_book_seat" json:"booking_id"`
	Booking *Booking `gorm:"foreignKey:BookingID"`
	SeatID    uint `gorm:"uniqueIndex:idx_book_seat" json:"seat_id"`
	Seat    *Seat    `gorm:"foreignKey:SeatID"`
}