package service

import (
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type PromotionService struct {
	DB *gorm.DB
}

func GetPromotionByID(id uint) (*entity.Promotion, error) {
    var promotion entity.Promotion
    err := connection.DB().
        Preload("PromotionType").
        Preload("CreateBy").
        Preload("Concert").
        First(&promotion, id).Error
    
    if err != nil {
        return nil, err
    }
    
    return &promotion, nil
}
func GetAllPromotions() ([]entity.Promotion, error) {
    var promotions []entity.Promotion
    err := connection.DB().
        Raw("SELECT * FROM promotions").
        Scan(&promotions).Error
    return promotions, err
}

func (s *PromotionService) CreatePromotion(promotion *entity.Promotion) (*entity.Promotion, error) {
    if err := s.DB.Create(promotion).Error; err != nil {
        return nil, err
    }
    // ดึง Promotion ที่เพิ่งสร้างขึ้นมาพร้อมกับ relations
    var createdPromo entity.Promotion
    if err := s.DB.
        Preload("PromotionType").
        Preload("CreateBy").
        Preload("Concert").
        First(&createdPromo, promotion.ID).Error; err != nil {
        return nil, err
    }
    return &createdPromo, nil
}


