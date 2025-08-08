package entity
import "gorm.io/gorm"

type Equipment struct{
	gorm.Model
	EquipmentName string `json:"equipment_name"`
	EquipmentAmount int `json:"equipment_amount"`
	
	EquipmentTypeID uint `json:"equipment_type_id"`
	EquipmentType *EquipmentType `gorm:"foreignKey: equipment_type_id" json:"equipmet_type"`

}