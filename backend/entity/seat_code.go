package entity

import (
	"gorm.io/gorm"
)

type SeatCode struct {
	gorm.Model
	SeatRow  string `json:"seat_row"`
	SeatNumber string `json:"seat_number"`
}