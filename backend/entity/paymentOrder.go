package entity

import (
   "gorm.io/gorm"
)

type PaymentOrder struct {
   gorm.Model
   CartID			uint      	      `json:"cart_id"` 
   Cart 			   *Cart    	      `gorm:"foreignKey: cart_id" json:"cart"`
   PromotionID  	uint    	         `json:"promotion_id"`
   Promotion      *Promotion        `gorm:"foreignKey: promotion_id" json:"promotion"`
   BasePrice      float32           `json:"base_price"`
   Discount       float32           `json:"discount"`
   TotalPrice     float32           `json:"total_price"`
   StatusID       uint    	         `json:"status_id"`
   Status         *PaymentStatus    `gorm:"foreignKey: status_id" json:"status"`
   MethodID      uint    		      `json:"method_id"`
   Method        *PaymentMethod     `gorm:"foreignKey: method_id" json:"method"`
}