package entity

import (
	"gorm.io/gorm"
)

type Seat struct {
	gorm.Model
	ZoneID uint `json:"zone_id"`
	Zone *Zone `gorm:"foreignKey:ZoneID" json:"zone"`
	VenueID uint `json:"venue_id"`
	Venue *Venue `gorm:"foreignKey:VenueID" json:"venue"`
	SeatCode uint `json:"seat_code"`
	Status string `gorm:"type:text" json:"seat_status"`
	// ENUM('available', 'booked', 'locked');default:'available'
}