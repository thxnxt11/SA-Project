package entity

import (
	"gorm.io/gorm"
)

type Bank struct {
	gorm.Model
	Bank_Name string `json:"bank_name"`
}