package entity

import (
   "gorm.io/gorm"
)

type PaymentStatus struct {
   gorm.Model
   Status string  `json:"status"`
}