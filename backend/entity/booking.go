package entity

import (
	"time"

	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model
	MemberID uint `json:"member_id"`
	Member *Members `gorm:"foreignKey:MemberID" json:"member"`
	ConcertID uint `json:"concert_id"`
	Concert *Concert `gorm:"foreignKey:ConcertID" json:"concert"`
	ZoneID uint `json:"zone_id"`
	Zone *Zone `gorm:"foreignKey:ZoneID" json:"zone"`
	PromotionID uint `json:"promotion_id"`
	PromotionId *Promotion `gorm:"foreignKey:PromotionID" json:"promotion"`
	QueueNumber int `json:"queue_number"`
	BookingStatusID uint `json:"booking_status_id"`
	BookingStatus *BookingStatus `gorm:"foreignKey:BookingStatusID" json:"booking_status"`
	BookingDate time.Time `json:"booking_date"`
	ExpiredDate time.Time `json:"expired_date"`
}