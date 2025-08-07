package entity

import (
	"gorm.io/gorm"
)

type Venue struct {
	gorm.Model
	VenueName string `json:"venue_name"`
	Location  string `json:"location"`
	Capacity  string `json:"venue_capacity"`
	VenueTypeID   uint   `json:"venue_type_id"`
	Venue     *VenueType `gorm:"foreignKey:VenueTypeID" json:"venue_type"`
	VenueStatusId uint `json:"venue_status_id"`
	VenueStatus *VenueStatus `grom:"foreignKey:VenueStatusID" json:"venue_status"`	
}