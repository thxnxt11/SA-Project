package entity

import(
	"gorm.io/gorm"
)

type PaymentMethod struct {
	gorm.Model
	PaymentMethod string `json:"payment_method"`
	
}