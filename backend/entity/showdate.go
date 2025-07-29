package entity

import (
	"time"

	"gorm.io/gorm"
)

type ShowDate struct {
	gorm.Model
	ConcertID uint `json:"concert_id"`
	Concert *Concert  `gorm:"foreignkey:ConcertID" json:"concert"`
	ShowDate time.Time `json:"show_date"`
}