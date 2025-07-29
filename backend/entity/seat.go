package entity

import(
	"gorm.io/gorm"
)

type Seat struct {
	gorm.Model
	ZoneID uint `json:"zone_id"`
	Zone *Zone `gorm:"foreignKey:ZoneID" json:"zone"`
	SeatCodeID uint `json:"seat_code_id"`
	SeatCode *SeatCode `gorm:"foreignkey:SeatCodeID" json:"seat_code"`
	Status string `gorm:"type:text" json:"seat_status"`
	// ENUM('available', 'booked', 'locked');default:'available'
}