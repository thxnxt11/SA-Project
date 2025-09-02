package entity

import (
   //"time"
   "gorm.io/gorm"
)

type Concert struct {
   gorm.Model
   Concert 	   string 	`json:"concert"`
}