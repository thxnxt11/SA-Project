package entity

import (
   "gorm.io/gorm"
)

type PaymentOrder struct {
   gorm.Model
   CartID			uint      	`json:"cart_id"` 
   Cart 			   *Cart    	`gorm:"foreignKey: cart_id" json:"cart"`
   PromotionID  	string    	`json:"promotion_id"`
   Promotion      *Promotion  `gorm:"foreignKey: promotion_id" json:"promotion"`
   BasePrice      float32     `json:"base_price"`
   Discount       float32     `json:"discount"`
   TotalPrice     float32     `json:"total_price"`
   StatusID       uint    	`json:"payment_id"`
   Status         *PaymentStatus  `gorm:"foreignKey: payment_id" json:"payment"`
   MedthodID      	uint    		`json:"medthod_id"`
   Medthod        	*PaymentMethod  `gorm:"foreignKey: medthod_id" json:"medthod"`
}