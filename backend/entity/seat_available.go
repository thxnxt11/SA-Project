package entity

import "gorm.io/gorm"

type SeatAvailable struct{
	gorm.Model
	ZoneID uint `json:"zone_id"`
	Zone *Booking `gorm:"foreignKey:ZoneID" json:"zone"`
	SeatID uint `json:"seat_id"`
	Seat *Seat `gorm:"foreignKey:SeatID" json:"seat"`
	SeatAvailableStatus string `gorm:"type:text" json:"seatavailable_status"`
	
}