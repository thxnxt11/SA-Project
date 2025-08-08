package entity

import (
	"time"

	"gorm.io/gorm"
)

type WorkSchedule struct {
	gorm.Model
	WorkHourName string `json:"work_hour_name"`
	Description string `json:"description"`
	WorkStart time.Time `json:"work_start"`
	WorkEnd time.Time `json:"work_end"`

	ConcertID uint `json:"concert_id"`
	Concert *User  `gorm:"foreignKey: concert_id" json:"cocert"`

}
