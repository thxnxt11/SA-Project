package Entity

import (
	"gorm.io/gorm"
)

type ReportType struct {
	gorm.Model
	Type_name string `json:"status_name"`
}