package entity

import (
   //"time"
   "gorm.io/gorm"
)

type CartItem struct {
   gorm.Model
   CartID 	uint8    	`json:"cart_id"`
   Cart    *User      `gorm:"foreignKey: cart_id" json:"cart"`
   VariantID	uint8     	`json:"variant_id"`
   Variant		*Variant	`gorm:"foreignKey: variant_id" json:"variant"`
}