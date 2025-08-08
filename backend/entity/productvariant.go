package entity

import (
   //"time"
   "gorm.io/gorm"
)

type Variant struct {
   gorm.Model
   ProductID 	uint8    	`json:"product_id"`
   Product    *Product      `gorm:"foreignKey: product_id" json:"product"`
   ColorID	uint8     	`json:"color_id"`
   Color		*Color	`gorm:"foreignKey: color_id" json:"color"`
   SizeID uint8     	`json:"size_id"`
   Size		*Color	`gorm:"foreignKey: size_id" json:"size"`
}