package entity

import (
   "gorm.io/gorm"
)

type PaymentMedthod struct {
   gorm.Model
   Method   string   `json:"promotion_id"`
}