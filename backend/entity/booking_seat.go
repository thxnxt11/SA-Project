package entity

import (
	"gorm.io/gorm"
)

type BookingSeat struct {
    gorm.Model

    BookingID uint      `gorm:"not null;index:idx_booking_seatavail,unique" json:"booking_id"`
    Booking   *Booking  `gorm:"foreignKey:BookingID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

    SeatAvailableID uint           `gorm:"not null;index:idx_booking_seatavail,unique" json:"seat_available_id"`
    SeatAvailable   *SeatAvailable `gorm:"foreignKey:SeatAvailableID;references:ID" json:"seat_available"`
}