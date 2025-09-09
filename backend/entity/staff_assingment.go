package entity

import (
	"time"

	"gorm.io/gorm"
)

type StaffAssignment struct {
	gorm.Model

	UserID uint  `json:"user_id"`
	User   *User `gorm:"foreignKey:UserID" json:"user"`

	AssignmentID uint        `json:"assignment_id"`
	Assignment   *Assignment `gorm:"foreignKey:AssignmentID" json:"assignment"`

	// สถานะของ staff ในงานนี้
	AssignmentStatusID uint              `json:"assignment_status_id"`
	AssignmentStatus   *AssignmentStatus `gorm:"foreignKey:AssignmentStatusID" json:"assignment_status"`

	// เวลา assign และ role ของ staff
	AssignedAt time.Time `json:"assigned_at"`
}

