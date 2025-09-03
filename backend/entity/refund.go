package entity

import (
	"time"

	"gorm.io/gorm"
)

type Refund struct {
	gorm.Model
	Reason      string    `json:"reason"`
	Amount      float32   `json:"amount"`
	Bank_number string    `json:"bank_number"`
	Consume     time.Time `json:"consume"`

	UserID uint   
	User  *User `gorm:"foreignKey:UserID"`

	BookingID uint   
	Booking   *Booking `gorm:"foreignKey:BookingID"`

	RefundStatusID uint         
	RefundStatus   *RefundStatus `gorm:"foreignKey:RefundStatusID"`

	PaymentID uint 
	Payment   *Payment `gorm:"foreignKey:PaymentID"`

	BankID uint
	Bank   *Bank `gorm:"foreignKey:BankID"`
}
