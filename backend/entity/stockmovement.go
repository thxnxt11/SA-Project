package entity

import (
   "gorm.io/gorm"
)

type Movement struct {
   gorm.Model
   WarehouseID      uint8     	`json:"warehouse_id"`
   Warehouse  	*Product    `gorm:"foreignKey: warehouse_id" json:"warehouse"`
   Adjusted    	string    	`json:"adjusted"`
   Amount       	uint8     	`json:"amount"`
   StaffID		uint8 	`json:"staff_id"`
   Staff  	*Users 	`gorm:"foreignKey: staff_id" json:"staff"`
}