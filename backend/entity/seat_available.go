package entity

import "gorm.io/gorm"

type SeatAvailable struct{
	gorm.Model
	ShowDateID uint `json:"showdate_id"`
	ShowDate *ShowDate `gorm:"foreignKey:ShowDateID" json:"showdate"`
	SeatAvailableStatus string `gorm:"type:text" json:"seatavailable_status"`
	BookingID uint `json:"booking_id"`
	Booking *Booking `gorm:"foreignKey:BookingID" json:"booking"`
}