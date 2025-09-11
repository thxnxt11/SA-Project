package entity
import "gorm.io/gorm"

type Equipment struct{
	gorm.Model
	EquipmentName string `json:"equipment_name"`

	EquipmentTotalQuantity     uint    `json:"total_quantity"`
	EquipmentRemainingQuantity uint    `json:"remaining_quantity"`
	EquipmentUsedQuantity      uint    `json:"used_quantity"`
	
	EquipmentTypeID uint `json:"equipment_type_id"`
	EquipmentType *EquipmentType `gorm:"foreignKey: equipment_type_id" json:"equipment_type"`


	StageEquipments []StageEquipment `gorm:"foreignKey:EquipmentID" json:"stage_equipments"`

}