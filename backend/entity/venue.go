package entity
import"gorm.io/gorm"

type Venue struct{
	gorm.Model
	VenueName string `json:"venue_name"`
	Location string `json:"location"`
	VenueCapacity int `json:"venue_capacity"`
	
	VenueTypeID uint `json:"venue_type_id"`
	VenueType *VenueType `gorm:"foreignKey: venue_type_id" json:"venue_type"`
	Stages        []Stage     `gorm:"foreignKey:VenueID" json:"stages"` // เพิ่มเพื่อเก็บ Stage(s

}

