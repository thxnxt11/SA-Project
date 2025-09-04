package entity

import (
   "gorm.io/gorm"
)

type Cart struct {
    gorm.Model
    UserID    uint       `json:"user_id"`
    User      *User      `gorm:"foreignKey:UserID" json:"user"`
    CartItems []CartItem `gorm:"foreignKey:CartID" json:"items"`
}