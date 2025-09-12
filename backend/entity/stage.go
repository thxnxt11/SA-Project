package entity
import "gorm.io/gorm"

type Stage struct {
	gorm.Model
	StageName string `json:"stage_name"`
	Width float32 `json:"width"`
	Length float32 `json:"length"`

	StageTypeID uint `json:"stage_type_id"`
	StageType *StageType `gorm:"foreignKey: stage_type_id" json:"stage_type"`

	VenueID uint `json:"venue_id"`
	Venue *Venue `gorm:"foreignKey: venue_id" json:"venue"`
	
	Equipments []StageEquipment `gorm:"foreignKey:StageID" json:"equipments"`
} 