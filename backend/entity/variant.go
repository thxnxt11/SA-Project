package entity

import (
   "gorm.io/gorm"
)

type Variant struct {
   gorm.Model
   ProductID 	uint    	`json:"product_id"`
   Product     *Product    `gorm:"foreignKey:ProductID" json:"product"`
   ColorID	   uint     	`json:"color_id"`
   Color		   *Color	   `gorm:"foreignKey:ColorID" json:"color"`
   SizeID      uint     	`json:"size_id"`
   Size		   *Size	      `gorm:"foreignKey:SizeID" json:"size"`
   Quantity    uint       `json:"quantity"`
   Picture     string      `json:"picture"`
}