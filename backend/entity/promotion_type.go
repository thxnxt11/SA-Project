package entity

import(
	"gorm.io/gorm"
)

type PromotionType struct {
	gorm.Model
	PromotionType string `json:"promotion_type"`
}