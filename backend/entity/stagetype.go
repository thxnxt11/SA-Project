package entity
import "gorm.io/gorm"

type StageType struct{
	gorm.Model
	StageType string `json:"stage_type"`
}