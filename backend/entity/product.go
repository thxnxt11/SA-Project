package entity

import (
   //"time"
   "gorm.io/gorm"
)

type Product struct {
   gorm.Model
   ProductName 		string    	`json:"product_name"`
   CatagoryID     	string    	`json:"catagory_id"`
   Catagory 		*Catagory  		`gorm:"foreignKey: catagory_id" json:"catagory"`
   ProductDetail	uint8     	`json:"product_detail"`
   ProductPrice  	string    	`json:"product_price"`
   ProductPictrue 	string 		`json:"product_pictrue"`
}