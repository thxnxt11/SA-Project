package entity

import (
	"time"
	"gorm.io/gorm"
)

type Concert struct {
	gorm.Model
	ConcertName string `json:"concert_name"`
	Artist      string `json:"artist"`
	OnsaleDate  time.Time `json:"onsale_date"`
	OffsaleDate time.Time `json:"offsale_date"`
	VenueID    uint `json:"venue_id"`
	Venue       *Venue `gorm:"foreignKey:VenueID" json:"venue"`
	ChartImage  string `json:"chart_image"`
}