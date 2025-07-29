package entity

import(
	"gorm.io/gorm"
)

type ZoneType struct {
	gorm.Model
	ZoneType string `json:"zone_type"`
}