package entity

import (
   "gorm.io/gorm"
)

type CartItem struct {
    gorm.Model
    CartID    uint     `json:"cart_id"`
    Cart      *Cart    `gorm:"foreignKey:CartID" json:"cart"`
    VariantID uint     `json:"variant_id"`
    Variant   *Variant `gorm:"foreignKey:VariantID" json:"variant"`
    Quantity  uint     `json:"quantity"`
}