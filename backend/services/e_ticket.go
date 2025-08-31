package services

import (
	"errors"
	"math"
	"time"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type ETicketservice struct {
	DB *gorm.DB
}

func NewETicketService() *ETicketservice {
	return &ETicketservice{DB: connection.DB()}
}

type ETicketResponse struct {
	UUID        string  `json:"uuid"`
	ConcertName string  `json:"concert_name"`
	VenueName   string  `json:"venue_name"`
	ShowTimeISO string  `json:"show_time_iso"`
	BookingCode string  `json:"booking_code"`
	ZoneType    string  `json:"zone_type"`
	Zone        string  `json:"zone"`
	SeatLabel   *string `json:"seat_label,omitempty"`
	QueueNumber *int    `json:"queue_number"`
	Price       int    `json:"price"`
}

// GetETicketByBookingID คืน e-tickets ทั้งหมดของ booking ที่จ่ายแล้ว (status = 2).
// - Seating: มีหลายใบ (ตามจำนวนที่นั่ง)
// - Standing: 1 ใบต่อ booking (ไม่มี SeatLabel)
func (s *ETicketservice) GetETicketByBookingID(bookingID uint) ([]ETicketResponse, error) {
	// 1) โหลด booking ก่อน พร้อม relation ที่ต้องใช้
	var b entity.Booking
	if err := s.DB.
		Preload("User").
		Preload("ShowDate.Concert").
		Preload("Zone.Venue").
		Preload("Zone.ZoneType").
		First(&b, bookingID).Error; err != nil {
		return nil, err // gorm.ErrRecordNotFound → controller แปลงเป็น 404 ได้
	}

	// 2) อนุญาตเฉพาะ booking ที่ชำระเงินแล้ว
	if b.BookingStatusID != 2 {
		return nil, errors.New("tickets are not paid or invalid")
	}

	// helper: format เวลาเป็น ISO8601 (กัน nil ของ ShowDate)
	showTimeISO := ""
	if b.ShowDate != nil && !b.ShowDate.ShowDate.IsZero() {
		// ใช้ time.RFC3339 หรือฟอร์แมตเดิมก็ได้
		showTimeISO = b.ShowDate.ShowDate.Format(time.RFC3339)
	}

	// helper: venue/zone/zonetype (กัน nil)
	concertName := ""
	if b.ShowDate != nil && b.ShowDate.Concert != nil {
		concertName = b.ShowDate.Concert.ConcertName
	}
	venueName := ""
	if b.Zone != nil && b.Zone.Venue != nil {
		venueName = b.Zone.Venue.VenueName
	}
	zoneName := ""
	if b.Zone != nil {
		zoneName = b.Zone.ZoneName
	}
	zoneType := ""
	if b.Zone != nil && b.Zone.ZoneType != nil {
		zoneType = b.Zone.ZoneType.ZoneType
	}
	price := int(math.Round(float64(b.Zone.ZonePrice)))

	// 3) โหลด booking_seats (ถ้ามี)
	var bookingSeats []entity.BookingSeat
	if err := s.DB.
		Where("booking_id = ?", b.ID).
		Preload("SeatAvailable.Seat").
		Find(&bookingSeats).Error; err != nil {
		return nil, err
	}
	
	etickets := make([]ETicketResponse, 0)

	// 4) Standing: ไม่มี booking_seats → สร้าง 1 ใบ
	if len(bookingSeats) == 0 {
		q := b.QueueNumber // ทำตัวแปรเพื่อเอาที่อยู่ไปใส่ pointer
		etickets = append(etickets, ETicketResponse{
			UUID:        b.BookingCode, // Standing ไม่มี UUID ต่อที่นั่ง เลยใช้ booking_code แทน 
			ConcertName: concertName,
			VenueName:   venueName,
			ShowTimeISO: showTimeISO,
			BookingCode: b.BookingCode,
			ZoneType:    zoneType,
			Zone:        zoneName,
			SeatLabel:   nil, // ไม่มีที่นั่ง
			QueueNumber: &q,
			Price:       price,
		})
		return etickets, nil
	}

	// 5) Seating: มีหลายใบ (ตามจำนวนที่นั่ง)
	for _, bs := range bookingSeats {
		var seatLabelPtr *string
		if bs.SeatAvailable != nil && bs.SeatAvailable.Seat != nil {
			seatCode := bs.SeatAvailable.Seat.SeatCode
			seatLabelPtr = &seatCode
		}

		q := b.QueueNumber
		etickets = append(etickets, ETicketResponse{
			UUID:        bs.TicketUUID, // ต้องมี column นี้ใน booking_seats
			ConcertName: concertName,
			VenueName:   venueName,
			ShowTimeISO: showTimeISO,
			BookingCode: b.BookingCode,
			ZoneType:    zoneType,
			Zone:        zoneName,
			SeatLabel:   seatLabelPtr,
			QueueNumber: &q, // จะเป็น 0 สำหรับ seating (แล้วแต่โมเดลคุณ)
			Price:       price,
		})
	}

	return etickets, nil
}
