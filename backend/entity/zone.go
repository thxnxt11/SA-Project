package entity

import (
	"gorm.io/gorm"
)
type Zone struct {
	gorm.Model
	ShowDateID uint `json:"showdate_id"`
	ShowDate *ShowDate `gorm:"foreignkey:ShowDateID" json:"show_date"`
	ZoneName string `json:"zone_name"`
	ZoneTypeID uint `json:"zonetype_id"`
	ZoneType *ZoneType `gorm:"foreignkey:ZoneTypeID" json:"zone_type"`
}