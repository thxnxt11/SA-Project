package entity
import "gorm.io/gorm"

type VenueStatus struct {
	gorm.Model
	VenueStatus string `json:"venue_status"`
}