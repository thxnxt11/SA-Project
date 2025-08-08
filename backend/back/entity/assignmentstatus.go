package entity
import "gorm.io/gorm"

type AssignmentStatus struct {
	gorm.Model
	AssignmentStatus string `json:"assignment_status"`
}