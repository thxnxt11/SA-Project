package entity
import "gorm.io/gorm"

type EquipmentType struct{
	gorm.Model
	EquipmentType string `json:"equipment_type"`
}

