package entity

import (
   "gorm.io/gorm"
)

type Cart struct {
   gorm.Model
   Cart        uint8       `json:"cart_id"`
   UserID 	   uint8    	`json:"user_id"`
   Users       *User      `gorm:"foreignKey: user_id" json:"user"`
   VariantID	uint8     	`json:"variant_id"`
   Variant		*Variant	   `gorm:"foreignKey: variant_id" json:"variant"`
   Quantity    uint8       `json:"quatity"`
}