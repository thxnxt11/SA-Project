package entity

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	gorm.Model
	Task string `json:"task"`
	Description string `json:"description"`
	AssignmentStart time.Time `json:"assignment_start"`
	AssignmentEnd time.Time `json:"assignment_end"`

	AssignmentStatusID uint `json:"assignment_status_id"`
	AssignmentStatus *AssignmentStatus  `gorm:"foreignKey: assignment_status_id" json:"assignment_status"`

	ConcertID uint `json:"concert_id"`
	Concert *Concert  `gorm:"foreignKey: concert_id" json:"concert"`
}