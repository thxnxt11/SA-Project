package entity

import (
	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Topic string `json:"topic"`
	description string  `json:"description"`

	UserID uint   
	User   *User `gorm:"foreignKey:MembersID"`

	ReportStatusID uint
	ReportStatus *ReportStatus `gorm:"foreignKey:ReportStatusID"`

	ReportTypeID uint
	ReportType *ReportType `gorm:"foreignKey:ReportTypeID"`
}
