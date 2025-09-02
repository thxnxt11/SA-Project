package entity

import  (
    "gorm.io/gorm"
)
type Product struct {
   gorm.Model
   ProductName 		string    	`json:"product_name"`
   CategoryID     	uint    	`json:"category_id"`
   Category 		*Category  	`gorm:"foreignKey: category_id" json:"category"`
   ProductDetail	string     	`json:"product_detail"`
   ProductPrice  	float32    	`json:"product_price"`
   Minimum  	    uint  	    `json:"minimum"`
   Sales    	    uint    	`json:"sales"`
   Total            uint     	`json:"total"`
   ConcertID        uint        `json:"concert_id"`
   Concert 		    *Concert  	`gorm:"foreignKey: concert_id" json:"concert"`
   Variants         []Variant   `gorm:"foreignKey:ProductID" json:"variants"`
}