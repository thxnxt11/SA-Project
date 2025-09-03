package entity

import (
	"gorm.io/gorm"
)

type Refund struct {
	gorm.Model
	Reason      string    `json:"reason"`
	Bank_number string    `json:"bank_number"`

	UserID uint   
	User   *User `gorm:"foreignKey:UserID"`

	BookingID uint   
	Booking   *Booking `gorm:"foreignKey:BookingID"`

	RefundStatusID uint         
	RefundStatus   *RefundStatus `gorm:"foreignKey:RefundStatusID"`

	PaymentID uint 
	Payment   *Payment `gorm:"foreignKey:PaymentID"`

	BankID uint
	Bank   *Bank `gorm:"foreignKey:BankID"`
}
