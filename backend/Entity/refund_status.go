package entity

import (
	"gorm.io/gorm"
)

type RefundStatus struct {
	gorm.Model
	Status_name string `json:"status_name"`
}