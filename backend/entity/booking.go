package entity

import (
	"time"
	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model
	UserID uint `json:"user_id"`
	User *User `gorm:"foreignKey:UserID" json:"user"`
	ShowDateID uint `json:"showdate_id"`
	ShowDate *ShowDate `gorm:"foreignKey:ShowDateID" json:"showdate"`
	ZoneID uint `json:"zone_id"`
	Zone *Zone `gorm:"foreignKey:ZoneID" json:"zone"`
	QueueNumber int `json:"queue_number"`
	TotalPrice int `json:"total_price"`
	BookingStatusID uint `json:"booking_status_id"`
	BookingStatus *BookingStatus `gorm:"foreignKey:BookingStatusID" json:"booking_status"`
	BookingDate time.Time `json:"booking_date"`
	ExpiredDate time.Time `json:"expired_date"`
}