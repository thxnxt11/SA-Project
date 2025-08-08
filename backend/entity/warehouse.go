package entity

import (
   "gorm.io/gorm"
)

type Warehouse struct {
   gorm.Model
   ProductID  	uint8 		`json:"product_id"`
   Product		*Product    `gorm:"foreignKey: product_id" json:"product"`
   Sales    	string    	`json:"sales"`
   Total       	uint8     	`json:"total"`
   Minimum  	string    	`json:"minimum"`
}