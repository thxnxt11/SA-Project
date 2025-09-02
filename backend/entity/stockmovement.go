package entity

import (
   "gorm.io/gorm"
)

type Stockmovement struct {
   gorm.Model
   ProductID 	   uint    	   `json:"product_id"`
   Product        *Product    `gorm:"foreignKey: product_id" json:"product"`
   Adjusted    	string    	`json:"adjusted"`
   Amount       	uint8     	`json:"amount"`
   StaffID		   uint8 	   `json:"staff_id"`
   Staff  	      *User 	   `gorm:"foreignKey: staff_id" json:"staff"`
}