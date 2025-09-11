package entity

import (
   "gorm.io/gorm"
)

type StockMovement struct {
    gorm.Model
    VariantID uint     `json:"variant_id"`
    Variant   *Variant `gorm:"foreignKey:VariantID" json:"variant"`
    ActionID  uint     `json:"action_id"`
    Action    *Action  `gorm:"foreignKey:ActionID" json:"action"`
    Amount    uint     `json:"amount"`
    StaffID   uint     `json:"staff_id"`
    Staff     *User    `gorm:"foreignKey:StaffID" json:"staff"`
}