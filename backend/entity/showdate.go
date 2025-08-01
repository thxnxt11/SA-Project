package entity

import (
	"time"

	"gorm.io/gorm"
)

type ShowDate struct {
	gorm.Model
	ConcertID uint `json:"concert_id"`
	Concert *Concert  `gorm:"foreignkey:ConcertID" json:"concert"`
	VenueID uint `json:"venue_id"`
	Venue *Venue `gorm:"foreignKey:VenueID" json:"venue"`
	ShowDate time.Time `json:"show_date"`
}