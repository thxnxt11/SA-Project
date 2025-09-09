package service

import (
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type EquipmentService struct {
	DB *gorm.DB
}

func (s *EquipmentService) GetAll() ([]entity.Equipment, error) {
    var equipments []entity.Equipment
    if err := s.DB.Preload("EquipmentType").
        Preload("EquipmentStatus").
        Preload("StageEquipments").
        Find(&equipments).Error; err != nil {
        return nil, err
    }
    return equipments, nil
}

func (s *EquipmentService) GetByID(id uint) (*entity.Equipment, error) {
    var eq entity.Equipment
    if err := s.DB.Preload("EquipmentType").
        Preload("EquipmentStatus").
        Preload("StageEquipments").
        First(&eq, id).Error; err != nil {
        return nil, err
    }
    return &eq, nil
}

func (s *EquipmentService) Create(eq *entity.Equipment) error {
    return s.DB.Create(eq).Error
}

func (s *EquipmentService) Update(eq *entity.Equipment) error {
    return s.DB.Model(&entity.Equipment{}).Where("id = ?", eq.ID).Updates(eq).Error
}

func (s *EquipmentService) Delete(id uint) error {
    return s.DB.Delete(&entity.Equipment{}, id).Error
}
