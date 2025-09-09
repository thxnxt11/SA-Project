package entity
import "gorm.io/gorm"

type Equipment struct{
	gorm.Model
	EquipmentName string `json:"equipment_name"`
	EquipmentQuantity int    `json:"equipment_quantity"`             // จำนวนอุปกรณ์
	
	EquipmentTypeID uint `json:"equipment_type_id"`
	EquipmentType *EquipmentType `gorm:"foreignKey: equipment_type_id" json:"equipmet_type"`

		
    EquipmentStatusID uint   `json:"equipment_status_id"`   // FK ไปยัง EquipmentStatus
    EquipmentStatus   *EquipmentStatus `gorm:"foreignKey:equipment_status_id" json:"equipment_status"`

	StageEquipments []StageEquipment `gorm:"foreignKey:EquipmentID" json:"stage_equipments"`

}