package Entity

import (
	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Topic string `json:"topic"`
	description string  `json:"gender"`

	MembersID uint   
	Members   *Members `gorm:"foreignKey:MembersID"`

	ReportStatusID uint
	ReportStatus *ReportStatus `gorm:"foreignKey:ReportStatusID"`

	ReportTypeID uint
	ReportType *ReportType `gorm:"foreignKey:ReportTypeID"`
}
