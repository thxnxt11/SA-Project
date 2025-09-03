package entity

import (
   "gorm.io/gorm"
)

type Variant struct {
   gorm.Model
   ProductID   uint    	`json:"product_id"`
   Product     *Product    `gorm:"foreignKey: product_id" json:"product"`
   ColorID	   uint     	`json:"color_id"`
   Color	   *Color	   `gorm:"foreignKey: color_id" json:"color"`
   SizeID      uint     	`json:"size_id"`
   Size		   *Size	      `gorm:"foreignKey: size_id" json:"size"`
   Quantity    uint       `json:"quantity"`
   Picture     string      `json:"picture"`
}