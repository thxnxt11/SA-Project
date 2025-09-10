package entity

import (
	"gorm.io/gorm"
)

type Seat struct {
	gorm.Model
	VenueID uint `json:"venue_id" gorm:"uniqueIndex:uniq_venue_seat"`
	Venue *Venue `gorm:"foreignKey:VenueID" json:"venue"`
	SeatCode string `json:"seat_code" gorm:"uniqueIndex:uniq_venue_seat"`
}