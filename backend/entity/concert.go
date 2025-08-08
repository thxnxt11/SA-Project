package entity

import (

   "gorm.io/gorm"
)

type Concert struct {
   gorm.Model
   Concert string    `json:"concert"`
}