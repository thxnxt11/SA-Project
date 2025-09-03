package entity

import (
   "gorm.io/gorm"
)

type StockMovement struct {
   gorm.Model
   ProductID uint     `json:"product_id"`
   Product   *Product `gorm:"foreignKey:ProductID" json:"product"`

   ActionID  uint     `json:"action_id"`
   Action    *Action  `gorm:"foreignKey:ActionID" json:"action"`

   Amount    uint     `json:"amount"`

   StaffID   uint     `json:"staff_id"`
   Staff     *User    `gorm:"foreignKey:StaffID" json:"staff"`
}