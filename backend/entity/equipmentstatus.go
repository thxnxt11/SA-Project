package entity
import "gorm.io/gorm"

type EquipmentStatus struct {
	gorm.Model
	EquipmentStatus string `json:"equipment_status"`
} 