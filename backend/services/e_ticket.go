package services

import (
	"errors"
	"math"
	"sort"
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
	Poster      string  `json:"concert_poster_url"`
	VenueName   string  `json:"venue_name"`
	ShowTimeISO string  `json:"show_time_iso"`
	BookingCode string  `json:"booking_code"`
	ZoneType    string  `json:"zone_type"`
	Zone        string  `json:"zone"`
	SeatLabel   *string `json:"seat_label,omitempty"`
	QueueNumber *int    `json:"queue_number"`
	Price       int    `json:"price"`
}
type MyEticketInfo struct {
	ConcertID   uint   `json:"concert_id"`
	ShowDateID  uint   `json:"show_date_id"`
	DateISO     string `json:"date_iso"`     // ใช้แสดง "27 APR"
	Title       string `json:"title"`        // ConcertName
	Venue       string `json:"venue"`        // VenueName
	PosterURL   string `json:"concert_poster_url"`   // ถ้ามี
	TicketCount int    `json:"ticket_count"` // รวมใบของงาน/รอบนี้
}
//เรียกหลังจากอัพโหลดหลักฐานสำเร็จ status = 2(paid)
func (s *ETicketservice) GetETicketByBookingID(bookingID uint) ([]ETicketResponse, error) {
	// 1) โหลด booking ก่อน พร้อม relation ที่ต้องใช้
	var b entity.Booking
	if err := s.DB.
		Preload("User").
		Preload("ShowDate.Concert").
		Preload("Zone.Venue").
		Preload("Zone.ZoneType").
		First(&b, bookingID).Error; err != nil {
		return nil, err 
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
			Poster: 	 b.ShowDate.Concert.Poster,
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
			Poster: 	 b.ShowDate.Concert.Poster,
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
func (s *ETicketservice) GetETicketByUserId(UserID uint) ([]MyEticketInfo,error){
	var bookings []entity.Booking
	if err := s.DB.
		Preload("ShowDate.Concert").
		Preload("ShowDate.Venue").
		Where("user_id = ? AND booking_status_id = ?",UserID, 2).
		Order("booking_date DESC").
		Find(&bookings).Error; err != nil{
		return nil,err
	}
	type key struct{ concertID, showDateID uint }
	agg := make(map[key]*MyEticketInfo)
	for _, b := range bookings {
		k := key{concertID: b.ShowDate.ConcertID, showDateID: b.ShowDateID}
		// นับจำนวนใบของ booking นี้:
		// - Seating: จำนวน BookingSeat
		// - Standing: อย่างน้อย 1 ใบ (ต่อ booking)
		var seatCount int64
		if err := s.DB.Model(&entity.BookingSeat{}).
			Where("booking_id = ?", b.ID).
			Count(&seatCount).Error; err != nil {
			return nil, err
		}
		countThisBooking := int(seatCount)
		if countThisBooking == 0 {
			countThisBooking = 1 // standing
		}
		if agg[k] == nil {
			// แปลงเวลาเป็น ISO
			showISO := b.ShowDate.ShowDate.Format("2006-01-02T15:04:05Z07:00")
			poster := b.ShowDate.Concert.Poster 
			agg[k] = &MyEticketInfo{
				ConcertID:   b.ShowDate.ConcertID,
				ShowDateID:  b.ShowDateID,
				DateISO:     showISO,
				Title:       b.ShowDate.Concert.ConcertName,
				Venue:       b.ShowDate.Venue.VenueName,
				PosterURL:   poster,
				TicketCount: 0,
			}
		}
		agg[k].TicketCount += countThisBooking
	}
	// map -> slice
	out := make([]MyEticketInfo, 0, len(agg))
	for _, v := range agg {
		out = append(out, *v)
	}
	// อยากคงลำดับตามล่าสุด? sort ตาม DateISO/ShowDateID ก็ได้
	sort.Slice(out, func(i, j int) bool { return out[i].DateISO > out[j].DateISO })
	return out, nil
}

func (s *ETicketservice) GetETicketByShowID(userID, concertID, showDateID uint) ([]ETicketResponse, error) {
	var bookings []entity.Booking

	if err := s.DB.
		Preload("ShowDate.Concert").
		Preload("ShowDate.Venue").
		Preload("Zone.Venue").
		Preload("Zone.ZoneType").
		Where("user_id = ? AND show_date_id = ? AND booking_status_id = ?", userID, showDateID, 2).
		Order("booking_date DESC").
		Find(&bookings).Error; err != nil {
		return nil, err
	}

	if len(bookings) == 0 {
		return nil, errors.New("no tickets found for this user and show")
	}

	var allETickets []ETicketResponse

	// วนลูปผ่าน bookings แต่ละใบ
	for _, b := range bookings {
		showTimeISO := ""
		if b.ShowDate != nil && !b.ShowDate.ShowDate.IsZero() {
			showTimeISO = b.ShowDate.ShowDate.Format(time.RFC3339)
		}

		concertName := ""
		poster := ""
		if b.ShowDate != nil && b.ShowDate.Concert != nil {
			concertName = b.ShowDate.Concert.ConcertName
			poster = b.ShowDate.Concert.Poster
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

		// ดึง booking_seats สำหรับ booking นี้
		var bookingSeats []entity.BookingSeat
		if err := s.DB.
			Where("booking_id = ?", b.ID).
			Preload("SeatAvailable.Seat").
			Find(&bookingSeats).Error; err != nil {
			return nil, err
		}

		// ถ้าไม่มี booking_seats = Standing Zone
		if len(bookingSeats) == 0 {
			q := b.QueueNumber
			eticket := ETicketResponse{
				UUID:        b.BookingCode, // Standing ใช้ booking_code เป็น UUID
				ConcertName: concertName,
				Poster:      poster,
				VenueName:   venueName,
				ShowTimeISO: showTimeISO,
				BookingCode: b.BookingCode,
				ZoneType:    zoneType,
				Zone:        zoneName,
				SeatLabel:   nil, // Standing ไม่มีที่นั่ง
				QueueNumber: &q,
				Price:       price,
			}
			allETickets = append(allETickets, eticket)
		} else {
			// ถ้ามี booking_seats = Seating Zone
			for _, bs := range bookingSeats {
				var seatLabelPtr *string
				if bs.SeatAvailable != nil && bs.SeatAvailable.Seat != nil {
					seatCode := bs.SeatAvailable.Seat.SeatCode
					seatLabelPtr = &seatCode
				}

				q := b.QueueNumber
				eticket := ETicketResponse{
					UUID:        bs.TicketUUID, // ใช้ ticket_uuid จาก booking_seats
					ConcertName: concertName,
					Poster:      poster,
					VenueName:   venueName,
					ShowTimeISO: showTimeISO,
					BookingCode: b.BookingCode,
					ZoneType:    zoneType,
					Zone:        zoneName,
					SeatLabel:   seatLabelPtr,
					QueueNumber: &q, // Seating อาจไม่ใช้ queue_number (แล้วแต่ business logic)
					Price:       price,
				}
				allETickets = append(allETickets, eticket)
			}
		}
	}

	return allETickets, nil
}