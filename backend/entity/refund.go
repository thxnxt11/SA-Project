package entity

import (

	"gorm.io/gorm"
)

type Refund struct {
	gorm.Model
	ID uint `json:"id"`
	Reason      string  `json:"reason"`
	Bank_number string  `json:"bank_number"`
	Amount      float32 `json:"amount"`

	UserID uint  `json:"user_id"`
	User   *User `gorm:"foreignKey:UserID" json:"user"`

	BookingID uint     `json:"booking_id"`
	Booking   *Booking `gorm:"foreignKey:BookingID" json:"booking"`

	 RefundStatusID uint          `json:"refund_status_id"`
	 RefundStatus   *RefundStatus `gorm:"foreignKey:RefundStatusID" json:"refund_status"`

	PaymentID uint     `json:"payment_id"`
	Payment   *Payment `gorm:"foreignKey:PaymentID" json:"payment"`

	BankID uint  `json:"bank_id"`
	Bank   *Bank `gorm:"foreignKey:BankID" json:"bank"`
}
