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
// ใช้ DTO เดิมที่มีอยู่:
type SeatAvailableDTO struct {
	SeatID             uint   `json:"seat_id"`
	SeatCode           string `json:"seat_code"`
	SeatAvailableStatus string `json:"seatavailable_status"` // normalized: available/locked/sold
}

type ZoneWithSeatsDTO struct {
	ID             uint                `json:"id"`
	ZoneName       string              `json:"zone_name"`
	ZonePrice      float32             `json:"zone_price"`
	ZoneType       string              `json:"zone_type"` // standing | seating | ...
	Capacity       *int                `json:"capacity,omitempty"`
	PendingHolds   *int                `json:"pending_holds,omitempty"`
	SeatSold       *int                `json:"seat_sold,omitempty"`
	AvailableCount *int                `json:"available_count,omitempty"`
	SeatAvailable  []SeatAvailableDTO  `json:"seat_available,omitempty"` // เฉพาะ Seating
}

func (s *ZoneService) GetZonesAvailableByShowDateID(showDateID uint64) ([]ZoneWithSeatsDTO, error) {
	var zones []entity.Zone
	// โหลดโซนของ showdate นี้ พร้อมชนิดโซน และ SeatAvailable + Seat
	if err := connection.DB().
		Preload("ZoneType").
		Preload("Seats.Seat").
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

		// Standing: ส่ง available_count (capacity - sold - holds)
		if z.ZoneTypeID == 1 || zoneType == "standing"{
			// นับสถานะจาก seat_available ถ้าไม่มีฟิลด์ SeatsSold/PendingHolds ใน zone
			// (รองรับทั้งสองแบบ)
			capacity := int(z.Capacity)

			var holds int64
			_ = connection.DB().Model(&entity.SeatAvailable{}).
				Where("zone_id = ? AND LOWER(seat_available_status) = ?", z.ID, "locked").
				Count(&holds).Error

			var sold int64
			_ = connection.DB().Model(&entity.SeatAvailable{}).
				Where("zone_id = ? AND LOWER(seat_available_status) = ?", z.ID, "sold").
				Count(&sold).Error

			// ถ้า model มี z.SeatsSold/z.PendingHolds ให้เอาค่านั้นมาก่อน
			if z.SeatSold > 0 || z.PendingHold > 0 {
				sold = int64(z.SeatSold)
				holds = int64(z.PendingHold)
			}

			avail := capacity - int(sold) - int(holds)
			if avail < 0 {
				avail = 0
			}

			dto.Capacity = &capacity
			tmpSold := int(sold)
			tmpHolds := int(holds)
			dto.SeatSold = &tmpSold
			dto.PendingHolds = &tmpHolds
			dto.AvailableCount = &avail

		} else {
			// Seating: list รายการ seat_available
			seats := make([]SeatAvailableDTO, 0, len(z.Seats))
			for _, sa := range z.Seats {
				code := ""
				if sa.Seat != nil {
					code = strings.TrimSpace(sa.Seat.SeatCode)
				}
				status := strings.ToLower(strings.TrimSpace(sa.SeatAvailableStatus))
				if status == "" {
					status = "booked"
				}
				seats = append(seats, SeatAvailableDTO{
					SeatID:              sa.SeatID,
					SeatCode:            strings.ToUpper(code),
					SeatAvailableStatus: status,
				})
			}
			dto.SeatAvailable = seats
		}

		out = append(out, dto)
	}

	return out, nil
}
