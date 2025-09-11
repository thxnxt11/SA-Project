package service

import (
	"fmt"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type VenueService struct {
	DB *gorm.DB
}

// -------------------- Get All Venues --------------------
func (s *VenueService) GetAllVenues() ([]entity.Venue, error) {
	var venues []entity.Venue
	if err := s.DB.
		Preload("VenueType").
		Preload("Stages.StageType").
		Preload("Stages.Equipments.Equipment").
		Preload("Stages.Equipments.Equipment.EquipmentType").
		Find(&venues).Error; err != nil {
		return nil, fmt.Errorf("failed to get venues: %w", err)
	}
	return venues, nil
}

// -------------------- Get Venue --------------------
// ดึง Venue พร้อม Stage และ Equipments
func (s *VenueService) GetVenueByID(id uint) (*entity.Venue, error) {
	var venue entity.Venue
	if err := s.DB.Preload("Stages.StageType").
		Preload("VenueType").
		Preload("Stages.Equipments.Equipment.EquipmentType").
		First(&venue, id).Error; err != nil {
		return nil, err
	}
	return &venue, nil
}

// -------------------- Get Available Equipments for Stage --------------------
// เรียกใช้ EquipmentService เพื่อดูอุปกรณ์ที่เหลือสำหรับ Stage
func (s *VenueService) GetAvailableEquipmentsForStage(stageID uint) ([]entity.Equipment, error) {
	eqService := &EquipmentService{DB: s.DB}
	return eqService.GetAvailableByStage(stageID)
}

// ปรับปรุงฟังก์ชัน UpdateTotalUsedEquipment ให้รับ transaction
func UpdateTotalUsedEquipment(tx *gorm.DB, equipmentID uint) (entity.Equipment, error) {
	var equipment entity.Equipment
	var usedTotal int64

	// 1️⃣ คำนวณจำนวนที่ถูกใช้จาก StageEquipment
	if err := tx.Model(&entity.StageEquipment{}).
		Where("equipment_id = ?", equipmentID).
		Select("COALESCE(SUM(stage_quantity), 0)").Scan(&usedTotal).Error; err != nil {
		return equipment, fmt.Errorf("failed to calculate used quantity: %w", err)
	}

	// 2️⃣ ดึงข้อมูล Equipment ปัจจุบัน
	if err := tx.First(&equipment, equipmentID).Error; err != nil {
		return equipment, fmt.Errorf("failed to fetch equipment: %w", err)
	}

	// 3️⃣ อัปเดตค่า used และ remaining
	equipment.EquipmentUsedQuantity = uint(usedTotal)

	if equipment.EquipmentUsedQuantity > equipment.EquipmentTotalQuantity {
		return equipment, fmt.Errorf(
			"equipment %s: used quantity (%d) exceeds total quantity (%d)",
			equipment.EquipmentName,
			equipment.EquipmentUsedQuantity,
			equipment.EquipmentTotalQuantity,
		)
	}

	equipment.EquipmentRemainingQuantity = equipment.EquipmentTotalQuantity - equipment.EquipmentUsedQuantity

	// 4️⃣ เซฟกลับ DB
	if err := tx.Model(&entity.Equipment{}).
		Where("id = ?", equipmentID).
		Updates(map[string]interface{}{
			"equipment_used_quantity":      equipment.EquipmentUsedQuantity,
			"equipment_remaining_quantity": equipment.EquipmentRemainingQuantity,
		}).Error; err != nil {
		return equipment, fmt.Errorf("failed to update equipment quantities: %w", err)
	}

	return equipment, nil
}


// ปรับปรุงฟังก์ชัน CreateVenueWithStagesAndEquipments
func (s *VenueService) CreateVenueWithStagesAndEquipments(v *entity.Venue) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// ตรวจสอบ Venue ซ้ำ
		var existing entity.Venue
		err := tx.Where("venue_name = ? AND location = ?", v.VenueName, v.Location).First(&existing).Error
		if err == nil {
			// return fmt.Errorf("venue with name '%s' and location '%s' create success", v.VenueName, v.Location)
		}

		// สร้าง Venue (ไม่รวม Stages)
		if err := tx.Omit("Stages").Create(v).Error; err != nil {
			return fmt.Errorf("failed to create venue: %w", err)
		}

		// สร้าง Stage(s) และ assign equipments
		seen := map[string]bool{}
		equipmentUpdates := map[uint]bool{} // เก็บ equipment IDs ที่ต้อง update

		for i := range v.Stages {
			stage := &v.Stages[i]
			stage.VenueID = v.ID
			stage.ID = 0

			// ตรวจสอบ stage ซ้ำ
			key := fmt.Sprintf("%s-%d", stage.StageName, stage.StageTypeID)
			if seen[key] {
				continue
			}
			seen[key] = true

			// แยก Equipments ออกก่อน Create stage
			equipments := stage.Equipments
			stage.Equipments = nil

			// สร้าง Stage
			if err := tx.Create(stage).Error; err != nil {
				return fmt.Errorf("failed to create stage %s: %w", stage.StageName, err)
			}

			// สร้าง StageEquipment records
			for _, se := range equipments {
				// ตรวจสอบว่า equipment มีอยู่จริงและมี quantity พอ
				var equipment entity.Equipment
				if err := tx.First(&equipment, se.EquipmentID).Error; err != nil {
					return fmt.Errorf("equipment with ID %d not found: %w", se.EquipmentID, err)
				}

				// สร้าง StageEquipment record
				stageEquipment := entity.StageEquipment{
					StageID:       stage.ID,
					EquipmentID:   se.EquipmentID,
					StageQuantity: se.StageQuantity,
				}

				if err := tx.Create(&stageEquipment).Error; err != nil {
					return fmt.Errorf("failed to create stage equipment for stage %s: %w", stage.StageName, err)
				}

				// เพิ่ม equipment ID เข้า list สำหรับ update
				equipmentUpdates[se.EquipmentID] = true
			}
		}

		// อัพเดต used quantity สำหรับ equipments ที่ถูกใช้
		for equipmentID := range equipmentUpdates {
			updatedEq, err := UpdateTotalUsedEquipment(tx, equipmentID,)
			if err != nil {
				return fmt.Errorf("failed to update total used quantity for equipment %d: %w", equipmentID, err)
			}

			// ตรวจสอบว่า quantity ไม่เกิน total quantity
			if updatedEq.EquipmentUsedQuantity > updatedEq.EquipmentTotalQuantity {
				return fmt.Errorf("equipment %s: used quantity (%d) exceeds total quantity (%d)",
					updatedEq.EquipmentName, updatedEq.EquipmentUsedQuantity, updatedEq.EquipmentTotalQuantity)
			}

			fmt.Printf("Equipment %s ใช้ไปแล้ว %d ชิ้น จากทั้งหมด %d ชิ้น\n",
				updatedEq.EquipmentName, updatedEq.EquipmentUsedQuantity, updatedEq.EquipmentTotalQuantity)
		}

		// Preload ข้อมูลล่าสุด
		// if err := tx.Preload("Stages.StageType").
		// 	Preload("VenueType").
		// 	Preload("Stages.Equipments.Equipment.EquipmentType").
		// 	First(v, v.ID).Error; err != nil {
		// 	return fmt.Errorf("failed to preload venue data: %w", err)
		// }

		return nil
	})
}

// ======================= Update Venue + Stage + Equipment =======================
func (s *VenueService) UpdateVenueWithStages(id uint, v *entity.Venue) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// ---------- อัปเดต Venue ----------
		if err := tx.Model(&entity.Venue{}).
			Where("id = ?", id).
			Updates(map[string]interface{}{
				"venue_name":     v.VenueName,
				"location":       v.Location,
				"venue_capacity": v.VenueCapacity,
				"venue_type_id":  v.VenueTypeID,
			}).Error; err != nil {
			return fmt.Errorf("failed to update venue: %w", err)
		}

		seenStages := map[string]bool{}
		var stageIDs []uint

		for i := range v.Stages {
			stage := &v.Stages[i]
			stage.VenueID = id

			key := fmt.Sprintf("%s-%d", stage.StageName, stage.StageTypeID)
			if seenStages[key] {
				continue
			}
			seenStages[key] = true

			// แยก Equipments ออกมาก่อน
			equipments := stage.Equipments
			stage.Equipments = nil

			// ---------- Create / Update Stage ----------
			if stage.ID == 0 {
				if err := tx.Create(stage).Error; err != nil {
					return fmt.Errorf("failed to create stage: %w", err)
				}
			} else {
				if err := tx.Model(&entity.Stage{}).
					Where("id = ?", stage.ID).
					Updates(map[string]interface{}{
						"stage_name":    stage.StageName,
						"stage_type_id": stage.StageTypeID,
					}).Error; err != nil {
					return fmt.Errorf("failed to update stage: %w", err)
				}
			}
			stageIDs = append(stageIDs, stage.ID)

			// ---------- จัดการ StageEquipment ----------
			var equipmentIDs []uint
			for _, se := range equipments {
				equipmentIDs = append(equipmentIDs, se.EquipmentID)

				var existingSE entity.StageEquipment
				err := tx.Where("stage_id = ? AND equipment_id = ?", stage.ID, se.EquipmentID).
					First(&existingSE).Error

				if err == gorm.ErrRecordNotFound {
					// ยังไม่มี → create
					newSE := entity.StageEquipment{
						StageID:       stage.ID,
						EquipmentID:   se.EquipmentID,
						StageQuantity: se.StageQuantity,
					}
					if err := tx.Create(&newSE).Error; err != nil {
						return fmt.Errorf("failed to assign equipment %d: %w", se.EquipmentID, err)
					}
				} else if err == nil {
					// มีอยู่แล้ว → update
					if err := tx.Model(&existingSE).
						Where("id = ?", existingSE.ID).
						Update("stage_quantity", se.StageQuantity).Error; err != nil {
						return fmt.Errorf("failed to update stage equipment %d: %w", existingSE.ID, err)
					}
				} else {
					return fmt.Errorf("failed to query stage equipment: %w", err)
				}
			}

			// ---------- ลบ StageEquipment ที่ไม่อยู่ใน payload ----------
			if len(equipmentIDs) > 0 {
				if err := tx.Where("stage_id = ? AND equipment_id NOT IN ?", stage.ID, equipmentIDs).
					Delete(&entity.StageEquipment{}).Error; err != nil {
					return fmt.Errorf("failed to delete removed stage equipments: %w", err)
				}
			} else {
				if err := tx.Where("stage_id = ?", stage.ID).
					Delete(&entity.StageEquipment{}).Error; err != nil {
					return fmt.Errorf("failed to delete all stage equipments: %w", err)
				}
			}
		}

		// ---------- ลบ Stage ที่ไม่อยู่ใน payload ----------
		if len(stageIDs) > 0 {
			if err := tx.Where("venue_id = ? AND id NOT IN ?", id, stageIDs).
				Delete(&entity.Stage{}).Error; err != nil {
				return fmt.Errorf("failed to delete removed stages: %w", err)
			}
		} else {
			if err := tx.Where("venue_id = ?", id).
				Delete(&entity.Stage{}).Error; err != nil {
				return fmt.Errorf("failed to delete all stages: %w", err)
			}
		}

		// ---------- Preload ข้อมูลล่าสุด ----------
		if err := tx.Preload("VenueType").
			Preload("Stages.StageType").
			Preload("Stages.Equipments.Equipment.EquipmentType").
			First(v, id).Error; err != nil {
			return fmt.Errorf("failed to preload venue: %w", err)
		}

		return nil
	})
}


// DeleteVenue: ลบ Venue และ Stage(s) พร้อมคืนจำนวนอุปกรณ์
func (s *VenueService) DeleteVenue(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// โหลด Stage และ Equipments ของ Venue
		var stages []entity.Stage
		if err := tx.Preload("Equipments").Where("venue_id = ?", id).Find(&stages).Error; err != nil {
			return err
		}

		eqService := &EquipmentService{DB: tx}

		// คืนจำนวนอุปกรณ์สำหรับทุก Stage
		for _, stage := range stages {
			for _, se := range stage.Equipments {
				if err := eqService.RestoreFromStage(se.EquipmentID, se.StageQuantity); err != nil {
					return fmt.Errorf("failed to restore equipment %d: %w", se.EquipmentID, err)
				}
			}
		}

		// ลบ Stage ทั้งหมด
		if err := tx.Where("venue_id = ?", id).Delete(&entity.Stage{}).Error; err != nil {
			return err
		}

		// ลบ Venue
		if err := tx.Delete(&entity.Venue{}, id).Error; err != nil {
			return err
		}

		return nil
	})
}

// DeleteStage: ลบ Stage เดียว พร้อมคืนจำนวนอุปกรณ์
func (s *VenueService) DeleteStage(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		var stage entity.Stage
		if err := tx.Preload("Equipments").First(&stage, id).Error; err != nil {
			return err
		}

		eqService := &EquipmentService{DB: tx}

		// คืนจำนวนอุปกรณ์
		for _, se := range stage.Equipments {
			if err := eqService.RestoreFromStage(se.EquipmentID, se.StageQuantity); err != nil {
				return fmt.Errorf("failed to restore equipment %d: %w", se.EquipmentID, err)
			}
		}

		// ลบ Stage
		if err := tx.Delete(&entity.Stage{}, id).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *VenueService) DeleteEquipment(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		var stage_eq entity.StageEquipment
		eqService := &EquipmentService{DB: tx}
		if err := eqService.RestoreFromStage(stage_eq.EquipmentID, stage_eq.StageQuantity); err != nil {
			return fmt.Errorf("failed to restore equipment %d: %w", stage_eq.EquipmentID, err)
		}

		if err := tx.Delete(&entity.StageEquipment{}, id).Error; err != nil {
			return err
		}

		return nil
	})
}

// ---------------- Type Methods ----------------
func (s *VenueService) GetVenueTypes() ([]entity.VenueType, error) {
	var types []entity.VenueType
	err := s.DB.Find(&types).Error
	return types, err
}

func (s *VenueService) GetStageTypes() ([]entity.StageType, error) {
	var types []entity.StageType
	err := s.DB.Find(&types).Error
	return types, err
}

// ---------------- Equipment Methods ----------------

// GetAllEquipment: ดึงอุปกรณ์ทั้งหมด
func (s *VenueService) GetAllEquipment() ([]entity.Equipment, error) {
	var equipments []entity.Equipment
	err := s.DB.Preload("EquipmentType").Find(&equipments).Error
	return equipments, err
}

// GetEquipmentByType: ดึงอุปกรณ์ตามประเภท
func (s *VenueService) GetEquipmentByType(typeID uint) ([]entity.Equipment, error) {
	var equipments []entity.Equipment
	err := s.DB.Where("equipment_type_id = ?", typeID).Preload("EquipmentType").Find(&equipments).Error
	return equipments, err
}
