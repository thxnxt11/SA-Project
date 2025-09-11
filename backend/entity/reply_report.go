package entity

import (
	"time"

	"gorm.io/gorm"
)

type ReportReply struct {
	gorm.Model
	ReportID  uint      `gorm:"not null"`
	AdminID   uint      `gorm:"not null"` // ผู้ตอบกลับ
	Message   string    `gorm:"type:text;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	
}
