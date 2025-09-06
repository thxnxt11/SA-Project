package entity

import (
	"gorm.io/gorm"
)

type Report struct {
	gorm.Model

	Topic string `json:"topic"`

	Description string `json:"description"`

	Photo string `gorm:"type:text" json:"photo"`

	UserID uint
	User   *User `gorm:"foreignKey:UserID" json:"user"`

	ReportStatusID uint          `json:"report_status_id"`
	ReportStatus   *ReportStatus `gorm:"foreignKey:ReportStatusID" json:"report_status"`

	ReportTypeID uint        `json:"report_type_id"`
	ReportType   *ReportType `gorm:"foreignKey:ReportTypeID" json:"report_type,omitempty"`
}

type ReportResponse struct {
	ID          uint   `json:"id"`
	Topic       string `json:"topic"`
	Description string `json:"description"`
	Photo       string `gorm:"type:text" json:"photo"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`

	User         *User         `json:"user,omitempty"`
	ReportStatus *ReportStatus `json:"report_status,omitempty"`
	ReportType   *ReportType   `json:"report_type,omitempty"`
}

type CreateReportRequest struct {
	Topic        string `json:"topic" binding:"required"`
	Description  string `json:"description" binding:"required"`
	Photo        string `gorm:"type:text" json:"photo"`
	UserID       uint   `json:"user_id"`
	ReportTypeID uint   `json:"report_type_id" binding:"required"`
}
