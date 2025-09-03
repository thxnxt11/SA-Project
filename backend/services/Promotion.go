package services

import (
	"errors"
	"strings"
	"time"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)


type PromotionService struct {
    DB *gorm.DB
}

type ValidatePromotionInput struct {
    Code      string `json:"code" binding:"required"`        // รหัสโปรโมชั่นที่ผู้ใช้กรอก
    Target    string `json:"target" binding:"required"`      // "ticket" | "product" สำหรับเช็คว่า code ที่กรอกมาใช้กับคอนเสิร์ตได้หรือไม่
    ConcertID uint   `json:"concert_id,omitempty"`           // ถ้าใช้กับคอนเสิร์ต ให้ส่งมาด้วย
}

type ValidatePromotionResult struct {
    PromotionID     uint   `json:"promotion_id"`
    Code            string `json:"code"`
    Type            string `json:"type"`              
    DiscountPercent int    `json:"discount_percent"`  
    AppliesTo       string `json:"applies_to"`        // "product" | "ticket,product"
    ConcertID       uint   `json:"concert_id,omitempty"`
    Name            string `json:"promotion_name"`
    Description     string `json:"promotion_description,omitempty"`
}

func NewPromotionService() *PromotionService {
    return &PromotionService{DB: connection.DB()}
}
func GetPromotionByID(id uint) (*entity.Promotion, error) {
    var promotion entity.Promotion
    err := connection.DB().
        Preload("PromotionType").
        Preload("User").
        Preload("Concert.User").
        First(&promotion, id).Error
    
    if err != nil {
        return nil, err
    }
    
    return &promotion, nil
}
func GetAllPromotions() ([]entity.Promotion, error) {

    var promotions []entity.Promotion
    err := connection.DB().
        Preload("PromotionType").
        Preload("User").
        Preload("Concert.User").
        Find(&promotions).Error
    return promotions, err
}

func GetAllConcert() ([]entity.Concert, error){
    var concerts []entity.Concert
    err := connection.DB().
        Preload("User").
        Preload("Venue").
        Preload("ShowDates").
        Find(&concerts).Error
    return concerts, err
}

func (s *PromotionService) CreatePromotion(promotion *entity.Promotion) (*entity.Promotion, error) {
    if err := s.DB.Create(promotion).Error; err != nil {
        return nil, err
    }
    var createdPromo entity.Promotion
    if err := s.DB.
        Preload("PromotionType").
        Preload("User").
        Preload("Concert").
        First(&createdPromo, promotion.ID).Error; err != nil {
        return nil, err
    }
    return &createdPromo, nil
}

var (
    ErrNotFound           = errors.New("promotion not found")
    ErrInactive           = errors.New("promotion is inactive")
    ErrOutOfDate          = errors.New("promotion is not with in valid date range")
    ErrUsageExceeded      = errors.New("promotion usage limit reached")
    ErrTargetNotAllowed   = errors.New("promotion can't be used for this target")
    ErrConcertScopeDenied = errors.New("promotion can't be used for this concert")
    ErrUnsupportedType    = errors.New("unsupported promotion type")
)

func (s *PromotionService) ValidatePromotionCode (in ValidatePromotionInput) (*ValidatePromotionResult, error){
    DB := s.DB

    in.Target = strings.ToLower(strings.TrimSpace(in.Target))
    if in.Target == "concert"{
        in.Target = "ticket"
    }

    var p entity.Promotion
    if err := DB.
        Where("LOWER(promotion_code) = ? ", strings.ToLower(strings.TrimSpace(in.Code))).
        First(&p).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            return nil, ErrNotFound
        }
        return nil, err
    }

    if strings.ToLower(p.Status) != "active" {
        return nil, ErrInactive
    }
    
    now :=  time.Now()

    if !p.StartDate.IsZero() && now.Before(p.StartDate) {
        return nil, ErrOutOfDate
    }

    if !p.EndDate.IsZero() && now.After(p.EndDate) {
        return nil, ErrOutOfDate
    }

    if p.Limit > 0 && p.UsedCount >= p.Limit {
        return nil, ErrUsageExceeded
    }

    var promoType , appliesTo string

    switch p.PromotionTypeId {
    case 2: // code
        promoType = "code"
        appliesTo = "product"
        if strings.ToLower(in.Target) != "product" {
            return nil, ErrTargetNotAllowed
        }
    case 3: // concert
        promoType = "concert"
        appliesTo = "ticket,product"
        if p.ConcertID > 0 {
            if in.ConcertID == 0 || in.ConcertID != p.ConcertID {
                return nil, ErrConcertScopeDenied
            }
        }
    default:
        return nil, ErrUnsupportedType

    }

    res := &ValidatePromotionResult{
        PromotionID:     p.ID,  
        Code:            p.PromotionCode,
        Type:            promoType,
        DiscountPercent: p.Discount,
        AppliesTo:       appliesTo,
        ConcertID:       p.ConcertID,
        Name:            p.PromotionName,
        Description:     p.Description,
    }
    return res, nil
}


