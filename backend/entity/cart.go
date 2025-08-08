package entity

import (
   //"time"
   "gorm.io/gorm"
)

type Cart struct {
   gorm.Model
   UserID 	uint8    	`json:"user_id"`
   Users    *Users      `gorm:"foreignKey: cartitem_id" json:"cartitem"`
   CartitemID	uint8     	`json:"cartitem_id"`
   Cartitem		*Cartitem	`gorm:"foreignKey: product_id" json:"product"`
}