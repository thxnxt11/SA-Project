package entity
import "gorm.io/gorm"

type AssignmentConcert struct{
	gorm.Model
	TaskConcert string `json:"task_concert"`
	Description string `json:"description"`
	AssignmentHour int `json:"assignment_hour"`

	WorkScheduleID uint `json:"work_schedule_id"`
	WorkSchedule *WorkSchedule  `gorm:"foreignKey: work_schedule_id" json:"schedule"`
}