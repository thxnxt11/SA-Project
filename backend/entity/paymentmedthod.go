package entity

import(
	"gorm.io/gorm"
)

type PaymentMethod struct {
	gorm.Model
	PaymentMethodName string `json:"payment_method"`
	AccountName   string `json:"account_name"`
	AccountNumber string `json:"account_number"`
	BankName      string `json:"bank_name"`
}