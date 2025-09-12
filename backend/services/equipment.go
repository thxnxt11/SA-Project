package services

import (
	"fmt"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type EquipmentService struct {
	DB *gorm.DB
}

// -------------------- CRUD พื้นฐาน --------------------

// GetAll คืนค่าอุปกรณ์ทั้งหมด พร้อม preload Type, Status, StageEquipments
func (s *EquipmentService) GetAll() ([]entity.Equipment, error) {
	var equipments []entity.Equipment
	err := s.DB.Preload("EquipmentType").
        Preload("StageEquipments.Stage.Venue").
		Preload("StageEquipments.Stage").
		Find(&equipments).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get all equipments: %w", err)
	}
	return equipments, nil
}

// GetByID คืนค่าอุปกรณ์ตาม ID พร้อม preload StageEquipments
func (s *EquipmentService) GetByID(id uint) (*entity.Equipment, error) {
	var eq entity.Equipment
	err := s.DB.Preload("EquipmentType").
		Preload("StageEquipments.Stage").
		First(&eq, id).Error
	if err != nil {
		return nil, fmt.Errorf("equipment not found: %w", err)
	}
	return &eq, nil
}

// Create เพิ่มอุปกรณ์ใหม่
func (s *EquipmentService) Create(eq *entity.Equipment) error {
	if err := s.DB.Create(eq).Error; err != nil {
		return fmt.Errorf("failed to create equipment: %w", err)
	}
	return nil
}

// Update แก้ไขอุปกรณ์
func (s *EquipmentService) Update(eq *entity.Equipment) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// ดึงข้อมูลปัจจุบัน
		var existing entity.Equipment
		if err := tx.First(&existing, eq.ID).Error; err != nil {
			return fmt.Errorf("equipment not found: %w", err)
		}

		// คำนวณจำนวนคงเหลือใหม่
		used := existing.EquipmentUsedQuantity
		newTotal := eq.EquipmentTotalQuantity

		if newTotal < used {
			return fmt.Errorf("total quantity (%d) น้อยกว่า used quantity (%d)", newTotal, used)
		}

		eq.EquipmentRemainingQuantity = newTotal - used

		// อัพเดต
		if err := tx.Model(&entity.Equipment{}).Where("id = ?", eq.ID).Updates(eq).Error; err != nil {
			return fmt.Errorf("failed to update equipment: %w", err)
		}

		return nil
	})
}

// Delete ลบอุปกรณ์
func (s *EquipmentService) Delete(id uint) error {
	if err := s.DB.Delete(&entity.Equipment{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete equipment: %w", err)
	}
	return nil
}

// -------------------- Stock / Stage Assignment --------------------

// AssignToStage เพิ่ม StageEquipment และลด remainingQuantity ของอุปกรณ์
func (s *EquipmentService) AssignToStage(stageID uint, eqID uint, qty uint) error {
	var eq entity.Equipment
	if err := s.DB.First(&eq, eqID).Error; err != nil {
		return fmt.Errorf("equipment not found: %w", err)
	}

	if eq.EquipmentRemainingQuantity < qty {
		return fmt.Errorf("not enough equipment %s: remaining %d", eq.EquipmentName, eq.EquipmentRemainingQuantity)
	}

	// เช็ค StageEquipment ว่ามีอยู่แล้วหรือยัง
	var stageEq entity.StageEquipment
	err := s.DB.Where("stage_id = ? AND equipment_id = ?", stageID, eqID).First(&stageEq).Error
	if err == nil {
		// record มีอยู่แล้ว -> update quantity
		stageEq.StageQuantity = qty
		if err := s.DB.Save(&stageEq).Error; err != nil {
			return err
		}
	} else if err == gorm.ErrRecordNotFound {
		// record ยังไม่มี -> create ใหม่
		stageEq = entity.StageEquipment{
			StageID:       stageID,
			EquipmentID:   eqID,
			StageQuantity: qty,
		}
		if err := s.DB.Create(&stageEq).Error; err != nil {
			return err
		}
	} else {
		return err
	}

	// ลด remainingQuantity
	eq.EquipmentRemainingQuantity -= qty
	return s.DB.Save(&eq).Error
}


// UpdateStageEquipments อัปเดต StageEquipments ของ Stage
// - ลด stock ของอุปกรณ์ใหม่
func (s *EquipmentService) UpdateStageEquipments(stageID uint, newEquipments []entity.StageEquipment) error {
	// ดึง StageEquipment เดิม
	var oldStageEq []entity.StageEquipment
	if err := s.DB.Where("stage_id = ?", stageID).Find(&oldStageEq).Error; err != nil {
		return err
	}

	// คืนค่า remainingQuantity ของอุปกรณ์เก่า
	for _, se := range oldStageEq {
		var eq entity.Equipment
		if err := s.DB.First(&eq, se.EquipmentID).Error; err == nil {
			eq.EquipmentRemainingQuantity += se.StageQuantity
			s.DB.Save(&eq)
		}
	}
	// ลบ StageEquipment เดิม
	if err := s.DB.Where("stage_id = ?", stageID).Delete(&entity.StageEquipment{}).Error; err != nil {
		return err
	}

	// เพิ่ม StageEquipment ใหม่ และลด remainingQuantity
	for _, se := range newEquipments {
		var eq entity.Equipment
		if err := s.DB.First(&eq, se.EquipmentID).Error; err != nil {
			return fmt.Errorf("equipment not found: %w", err)
		}
		if eq.EquipmentRemainingQuantity < se.StageQuantity {
			return fmt.Errorf("not enough equipment %s: remaining %d", eq.EquipmentName, eq.EquipmentRemainingQuantity)
		}
		eq.EquipmentRemainingQuantity -= se.StageQuantity
		if err := s.DB.Save(&eq).Error; err != nil {
			return err
		}

		se.StageID = stageID
		if err := s.DB.Create(&se).Error; err != nil {
			return err
		}
	}

	return nil
}

// GetAvailableByStage คืนค่าอุปกรณ์ที่มี remainingQuantity > 0
func (s *EquipmentService) GetAvailableByStage(stageID uint) ([]entity.Equipment, error) {
	var equipments []entity.Equipment
	err := s.DB.Preload("EquipmentType").
		Preload("StageEquipments", "stage_id = ?", stageID).
		Find(&equipments).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get available equipments for stage %d: %w", stageID, err)
	}

	// กรองเฉพาะ remainingQuantity > 0 หรือใช้อยู่ใน stage เดิม
	filtered := make([]entity.Equipment, 0)
	for _, eq := range equipments {
		usedInStage := false
		for _, se := range eq.StageEquipments {
			if se.StageID == stageID {
				usedInStage = true
				break
			}
		}
		if eq.EquipmentRemainingQuantity > 0 || usedInStage {
			filtered = append(filtered, eq)
		}
	}

	return filtered, nil
}
func (s *EquipmentService) GetEquipmentTypes() ([]entity.EquipmentType, error) {
    var types []entity.EquipmentType
    if err := s.DB.Find(&types).Error; err != nil {
        return nil, fmt.Errorf("failed to get equipment types: %w", err)
    }
    return types, nil
}

func (s *EquipmentService) RestoreFromStage(equipmentID uint, quantity uint) error {
	return s.DB.Model(&entity.Equipment{}).
		Where("id = ?", equipmentID).
		UpdateColumn("equipment_remaining_quantity", gorm.Expr("equipment_remaining_quantity + ?", quantity)).
		UpdateColumn("equipment_used_quantity", gorm.Expr("equipment_used_quantity - ?", quantity)).	
		Error
}
