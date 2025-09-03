package entity

import (
	"gorm.io/gorm"
)

type ReportStatus struct {
	gorm.Model	
	Status_name string `json:"status_name"`
}