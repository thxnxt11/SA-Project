package service

import (
	"fmt"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type VenueService struct {
	DB *gorm.DB
}

// ---------------- Venue CRUD ----------------
func (s *VenueService) GetAllVenues() ([]entity.Venue, error) {
	var venues []entity.Venue
	err := s.DB.Preload("VenueType").
		Preload("Stages.StageType").
		Find(&venues).Error
	return venues, err
}

func (s *VenueService) GetVenueByID(id uint) (entity.Venue, error) {
	var venue entity.Venue
	err := s.DB.Preload("VenueType").
		Preload("Stages.StageType").
		First(&venue, id).Error
	return venue, err
}

// สร้าง Venue พร้อม Stage(s) โดยไม่ซ้ำ
// สร้าง Venue พร้อม Stage(s) โดยไม่ซ้ำ
func (s *VenueService) CreateVenueWithStages(v *entity.Venue) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// ตรวจสอบ Venue ซ้ำตามชื่อ + location
		var existing entity.Venue
		err := tx.Where("venue_name = ? AND location = ?", v.VenueName, v.Location).First(&existing).Error
		if err == nil {
			return fmt.Errorf("venue with name '%s' and location '%s' already exists", v.VenueName, v.Location)
		} else if err != gorm.ErrRecordNotFound {
			return err
		}

		// สร้าง Venue ใหม่โดยไม่ insert associations อัตโนมัติ
		if err := tx.Omit("Stages").Create(v).Error; err != nil {
			return err
		}

		// สร้าง Stage(s) ใหม่โดยไม่ซ้ำ
		seen := map[string]bool{}
		for i := range v.Stages {
			stage := &v.Stages[i]
			stage.VenueID = v.ID
			stage.ID = 0 // บังคับให้ GORM สร้าง ID ใหม่

			// ใช้ชื่อ + type เป็น key ตรวจสอบซ้ำ
			key := fmt.Sprintf("%s-%d", stage.StageName, stage.StageTypeID)
			if seen[key] {
				continue
			}
			seen[key] = true

			if err := tx.Create(stage).Error; err != nil {
				return err
			}
		}

		// ดึงข้อมูล Venue พร้อม Stage(s) กับ VenueType ให้พร้อม
		if err := tx.Preload("Stages.StageType").Preload("VenueType").First(v, v.ID).Error; err != nil {
			return err
		}

		return nil
	})
}



// อัพเดต Venue พร้อม Stage(s) โดยไม่ซ้ำ
func (s *VenueService) UpdateVenueWithStages(id uint, v *entity.Venue) error {
    return s.DB.Transaction(func(tx *gorm.DB) error {
        // อัปเดต Venue ตาม id
        if err := tx.Model(&entity.Venue{}).Where("id = ?", id).Updates(v).Error; err != nil {
            return err
        }

        // กัน Stage ซ้ำ
        seen := map[string]bool{}
        for i := range v.Stages {
            stage := &v.Stages[i]
            stage.VenueID = id

            key := fmt.Sprintf("%s-%d", stage.StageName, stage.StageTypeID)
            if seen[key] {
                continue
            }
            seen[key] = true

            if stage.ID == 0 {
                if err := tx.Create(stage).Error; err != nil {
                    return err
                }
            } else {
                if err := tx.Model(&entity.Stage{}).Where("id = ?", stage.ID).Updates(stage).Error; err != nil {
                    return err
                }
            }
        }

        // ลบ Stage ที่ไม่อยู่ใน payload
        var stageIDs []uint
        for _, s := range v.Stages {
            if s.ID != 0 {
                stageIDs = append(stageIDs, s.ID)
            }
        }
        if len(stageIDs) > 0 {
            if err := tx.Where("venue_id = ? AND id NOT IN ?", id, stageIDs).Delete(&entity.Stage{}).Error; err != nil {
                return err
            }
        } else {
            if err := tx.Where("venue_id = ?", id).Delete(&entity.Stage{}).Error; err != nil {
                return err
            }
        }

        // preload ข้อมูลใหม่
        if err := tx.Preload("Stages.StageType").Preload("VenueType").First(v, id).Error; err != nil {
            return err
        }

        return nil
    })
}


// DeleteVenue: ลบ Venue และ Stage(s) ที่เกี่ยวข้อง
func (s *VenueService) DeleteVenue(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// ลบ Stage ของ Venue
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

// DeleteStage: ลบ Stage เดียวโดยไม่กระทบ Venue หรือ Stage อื่น
func (s *VenueService) DeleteStage(id uint) error {
	return s.DB.Delete(&entity.Stage{}, id).Error
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

func (s *VenueService) GetEquipmentTypes() ([]entity.EquipmentType, error) {
	var types []entity.EquipmentType
	err := s.DB.Find(&types).Error
	return types, err
}
