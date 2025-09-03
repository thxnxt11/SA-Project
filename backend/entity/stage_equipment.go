package entity
import "gorm.io/gorm"

type StageEquipment struct {
	gorm.Model
	EquipmentID uint `json:"equipment_id"`
	Equipment *Equipment `gorm:"foreignKey: equipment_id" json:"equipment"`
	StageID uint `json:"stage_id"`
	Stage *Stage `gorm:"foreignKey: stage_id" json:"stage"`
}