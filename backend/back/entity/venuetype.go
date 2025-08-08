package entity
import "gorm.io/gorm"

type VenueType struct {
	gorm.Model
	VenueType string `json:"venue_type"`
}