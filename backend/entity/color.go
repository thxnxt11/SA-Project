package entity

import (
   //"time"
   "gorm.io/gorm"
)

type Color struct {
   gorm.Model
   Color	string	`json:"color"`
}