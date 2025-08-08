package entity

import "gorm.io/gorm"

type StaffAssignment struct {
	gorm.Model
	
	UserID uint  `json:"user_id"`
	User   *User `gorm:"foreignKey: user_id" json:"user"`
	
	AssignmentID uint  `json:"assignment_id"`
	Assignment   *Assignment `gorm:"foreignKey: assignment_id" json:"assignment"`

	AssignmentConcertID uint  `json:"assignment_concert_id"`
	AssignmentConcert   *AssignmentConcert `gorm:"foreignKey: assignment_concert_id" json:"assignment_concert"`


	
}
