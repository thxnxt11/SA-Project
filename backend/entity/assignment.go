package entity

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	gorm.Model
	Task                string `json:"task"`
	Description         string  `json:"description"`
	AssignmentDateStart time.Time `json:"assignment_date_start"`
	AssignmentDateEnd   time.Time `json:"assignment_date_end"`
	AssignmentTimeStart time.Time `json:"assignment_time_start"`
	AssignmentTimeEnd   time.Time `json:"assignment_time_end"`

	AssignmentStatusID uint
	AssignmentStatus   *AssignmentStatus `gorm:"foreignKey:AssignmentStatusID" json:"assignment_status"`

	ShowDateID uint 
	ShowDate   *ShowDate `gorm:"foreignKey:ShowDateID" json:"show_date"`

	// Relation กับ StaffAssignments
	 StaffAssignments []StaffAssignment `gorm:"foreignKey:AssignmentID" json:"staff_assignments"`

	// สำหรับ convenience แสดง staff โดยตรง
	Staffs []*User `gorm:"many2many:staff_assignments;joinForeignKey:AssignmentID;joinReferences:UserID" json:"staffs"`
}

