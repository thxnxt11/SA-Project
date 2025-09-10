package services

import (
	"strings"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)
type ZoneService struct {
	DB *gorm.DB
}

func NewZoneService() *ZoneService { return &ZoneService{} }

type SeatAvailableDTO struct {
	SeatID             uint   `json:"seat_id"`
	SeatCode           string `json:"seat_code"`
	SeatAvailableStatus string `json:"seatavailable_status"` 
}
	
type ZoneWithSeatsDTO struct {
	ID             uint                `json:"id"`
	ZoneName       string              `json:"zone_name"`
	ZonePrice      float32             `json:"zone_price"`
	ZoneType       string              `json:"zone_type"` 
	Capacity       *int                `json:"capacity,omitempty"`
	PendingHolds   *int                `json:"pending_holds,omitempty"`
	SeatSold       *int                `json:"seat_sold,omitempty"`
	AvailableCount *int                `json:"available_count,omitempty"`
}

func (s *ZoneService) GetZonesAvailableByShowDateID(showDateID uint64) ([]ZoneWithSeatsDTO, error) {


	var zones []entity.Zone

	if err := connection.DB().
		Preload("ZoneType").
		Where("show_date_id = ?", showDateID).
		Find(&zones).Error; err != nil {
		return nil, err
	}

	out := make([]ZoneWithSeatsDTO, 0, len(zones))

	for _, z := range zones {
		zoneType := ""
		if z.ZoneType != nil {
			zoneType = strings.ToLower(strings.TrimSpace(z.ZoneType.ZoneType))
		}

		dto := ZoneWithSeatsDTO{
			ID:        z.ID,
			ZoneName:  z.ZoneName,
			ZonePrice: z.ZonePrice,
			ZoneType:  zoneType,
		}

		capacity := int(z.Capacity)
		sold := int(z.SeatSold)        // จำนวนที่ขายแล้วจากฟิลด์ในตารางโซน
		holds := int(z.PendingHold)    // จำนวนที่กำลัง locked จากฟิลด์ในตารางโซน

		avail := capacity - sold - holds
		if avail < 0 {
			avail = 0
		}

		dto.Capacity = &capacity
		dto.SeatSold = &sold
		dto.PendingHolds = &holds
		dto.AvailableCount = &avail

		out = append(out, dto)
	}

	return out, nil
}
