package entity

import (
	"time"

	"gorm.io/gorm"
)

type Promotion struct {
	gorm.Model
	PromotionName string `json:"promotion_name"`
	Description   string `json:"promotion_description"`
	PromotionTypeId uint `json:"promotion_type_id"`
	PromotionType *PromotionType `gorm:"foreignKey:PromotionTypeId" json:"promotion_type"`
	PromotionCode string `json:"promotion_code"`
	Discount      int `json:"discount"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Limit int `json:"limit"`
	UsedCount int `json:"used_count"`
	Status string `gorm:"type:text" json:"promotion_status"` //ENUM('active', 'inactive')
	UserID uint `json:"user_id"`
	CreateBy *User `gorm:"foreignKey:UserID" json:"user"`
	ConcertID uint `json:"concert_id"`
	Concert *Concert `gorm:"foreignKey:ConcertID" json:"concert"`
	Poster string `json:"poster_url"`
}