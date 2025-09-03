package entity

import "gorm.io/gorm"

type Color struct {
   gorm.Model
   Color string   `json:"color"`
}