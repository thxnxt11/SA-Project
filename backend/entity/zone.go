package entity

import (
	"gorm.io/gorm"
)
type Zone struct {
	gorm.Model
	ShowDateID uint `json:"showdate_id"`
	ShowDate *ShowDate `gorm:"foreignkey:ShowDateID" json:"show_date"`
	VenueID uint `json:"venue_id"`
	Venue *Venue `gorm:"foreignKey:VenueID" json:"venue"`
	ZoneName string `json:"zone_name"`
	ZoneTypeID uint `json:"zonetype_id"`
	ZoneType *ZoneType `gorm:"foreignkey:ZoneTypeID" json:"zone_type"`
}