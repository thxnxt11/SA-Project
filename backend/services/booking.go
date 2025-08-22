package services

import (
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type SeatDTO struct {
	ID     uint   `json:"id"`     // seat_id
	Code   string `json:"code"`   // เช่น "A10"
	Row    string `json:"row"`    // เช่น "A"
	Number int    `json:"number"` // 10
	Status string `json:"status"` // "available" | "booked"
}

type BookingService struct {
	seatCodeRe *regexp.Regexp
}

func NewBookingService() *BookingService {
	return &BookingService{
		seatCodeRe: regexp.MustCompile(`^([A-Za-z]+)(\d+)$`),
	}
}

// Business Logic: แปลง seat code เป็น row และ number
func (s *BookingService) splitSeatCode(code string) (row string, number int) {
	code = strings.TrimSpace(code)
	if code == "" {
		return "-", 0
	}
	m := s.seatCodeRe.FindStringSubmatch(code)
	if len(m) == 3 {
		row = strings.ToUpper(m[1])
		num, _ := strconv.Atoi(m[2])
		return row, num
	}
	// fallback: ทั้งหมดถือเป็น row
	return strings.ToUpper(code), 0
}

// Business Logic: แปลง entity เป็น DTO
func (s *BookingService) convertToSeatDTO(seats []entity.SeatAvailable) []SeatDTO {
	out := make([]SeatDTO, 0, len(seats))
	for _, r := range seats {
		code := ""
		if r.Seat != nil {
			code = r.Seat.SeatCode
		}
		row, num := s.splitSeatCode(code)
		status := r.SeatAvailableStatus

		out = append(out, SeatDTO{
			ID:     r.SeatID,
			Code:   strings.ToUpper(strings.TrimSpace(code)),
			Row:    row,
			Number: num,
			Status: status,
		})
	}
	return out
}

// Business Logic: เรียงลำดับที่นั่ง
func (s *BookingService) sortSeats(seats []SeatDTO) {
	sort.Slice(seats, func(i, j int) bool {
		if seats[i].Row == seats[j].Row {
			return seats[i].Number < seats[j].Number
		}
		return seats[i].Row < seats[j].Row
	})
}

// Main Business Logic: ดึงข้อมูลที่นั่งตาม Zone ID
func (s *BookingService) GetSeatsByZoneID(zoneID uint64) ([]SeatDTO, error) {
	var seats []entity.SeatAvailable
	
	if err := connection.DB().
		Where("zone_id = ?", zoneID).
		Preload("Seat", func(tx *gorm.DB) *gorm.DB { return tx.Order("seat_code ASC") }).
		Order("seat_id ASC").
		Find(&seats).Error; err != nil {
		return nil, err
	}

	// แปลงเป็น DTO
	result := s.convertToSeatDTO(seats)
	
	// เรียงลำดับ
	s.sortSeats(result)

	return result, nil
}