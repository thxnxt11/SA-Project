package entity

import "gorm.io/gorm"

type VenueType struct{
	gorm.Model
	Venuetype string `json:"venue_type"`
}