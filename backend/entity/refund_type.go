package entity

import "gorm.io/gorm"

type RefundType struct {
	gorm.Model
	RefundTypeName string `json:"refund_type_name"`
	RefundFee      int    `json:"refund_fee"` 
}