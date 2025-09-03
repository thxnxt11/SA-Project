package entity

import (
   "gorm.io/gorm"
)

type Catagory struct {
   gorm.Model
   Catagory 	string 	`json:"catagory"`
}