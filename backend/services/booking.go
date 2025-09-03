package services

import (
	"errors"
	"fmt"
	"math/rand"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SeatDTO struct {
    ID uint `json:"id"`
	SeatID     uint   `json:"seatid"`     // seat_id
	Code   string `json:"code"`   // เช่น "A10"
	Row    string `json:"row"`    // เช่น "A"
	Number int    `json:"number"` // 10
	Status string `json:"status"` // "available" | "booked" | "locked"
}

type BookingService struct {
	seatCodeRe *regexp.Regexp
	DB 	   *gorm.DB
}

func NewBookingService() *BookingService {
	return &BookingService{
		seatCodeRe: regexp.MustCompile(`^([A-Za-z]+)(\d+)$`),
	}
}

// แปลง seat code เป็น row และ number
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

// แปลง entity เป็น DTO
func (s *BookingService) convertToSeatDTO(seats []entity.SeatAvailable) []SeatDTO {
	res := make([]SeatDTO, 0, len(seats))
	for _, r := range seats {
		code := ""
		if r.Seat != nil {
			code = r.Seat.SeatCode
		}
		row, num := s.splitSeatCode(code)
		status := r.SeatAvailableStatus

		res = append(res, SeatDTO{
            ID: r.ID,
			SeatID:     r.SeatID,
			Code:   strings.ToUpper(strings.TrimSpace(code)),
			Row:    row,
			Number: num,
			Status: status,
		})
	}
	return res
}

//  เรียงลำดับที่นั่ง
func (s *BookingService) sortSeats(seats []SeatDTO) {
	sort.Slice(seats, func(i, j int) bool {
		if seats[i].Row == seats[j].Row {
			return seats[i].Number < seats[j].Number
		}
		return seats[i].Row < seats[j].Row
	})
}

// Main: ดึงข้อมูลที่นั่งตาม Zone ID
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
	
	// เรียงลำดับก่อนส่งให้ frontend
	s.sortSeats(result)

	return result, nil
}

var (
	ErrSeatNotFound     = errors.New("seat not found in this zone/showdate")
	ErrSeatAlreadyTaken = errors.New("one or more seats are not available")
)

type CreateBookingInput struct {
	UserID          uint
	ShowDateID      uint
	ZoneID          uint
	SeatIDs         []uint 
	QueueNumber     int
	TotalPrice      int
	BookingStatusID uint   
	HoldMinutes     int    
}

func GenerateBookingCode() string {
    return fmt.Sprintf("BK%06d", rand.Intn(1000000))
}

// สร้าง booking 
func (s *BookingService) CreateBooking(in CreateBookingInput) (*entity.Booking, error) {
    db := s.DB
    if db == nil {
        db = connection.DB()
    }

    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            panic(r)
        }
    }()

    var code string
    for {
        code = GenerateBookingCode()
        var count int64
        tx.Model(&entity.Booking{}).Where("booking_code = ?", code).Count(&count)
        if count == 0 {
            break
        }
    }

    //คำนวณ expired time(เวลาที่จะคืนที่นั่งให้กับระบบหากไม่มีการชำระเงิน)
    now := time.Now()
    exp := now
    if in.HoldMinutes > 0 {
        exp = now.Add(time.Duration(in.HoldMinutes) * time.Minute)
    }else{
		exp = now.Add(2 * time.Minute) // default 15 นาที (test 2 นาที)
	}

    //LOCK โซนเสมอเพื่อคุม PendingHold/Capacity ----
    var zone entity.Zone
    if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}). //lock entity zone เพื่อรอให้อัพเดตเสร็จ
        First(&zone, in.ZoneID).Error; err != nil {
        tx.Rollback() //ถ้า error ให้ rollback
        return nil, err
    }

    // ถ้าเป็น standing zone quantity = 1
    quantity := 1
    isStanding := len(in.SeatIDs) == 0  // standing zone = ไม่มีการเลือก seat แต่ใช้เป็น queue แทน
    if !isStanding {
        quantity = len(in.SeatIDs) //ถ้าเป็น seating zone ให้นับจำนวน seatIDs ที่ส่งเข้ามา
    }

    // ---- check Capacity ----
    // seatsold + pendinghold + quantity <= capacity 
    // เพราะว่าถ้าตัวเลขที่ขายไปแล้ว + รอการดำเนินการ + ที่เข้ามาใหม่ มากกว่า ความจุที่รับ จะทำให้เกิดที่นั่งที่ไม่มีอยู่จริง
    // PendingHold คือ filed ที่บอกว่า ณ ตอนนี้ มีที่นั่งหรือคิวไหนที่ยังรอการดำเนินการการชำระเงินอยู่
    // SeatSold คือ filed ที่บอกว่า ณ ตอนนี้ ที่นั่งหรือคิวนั้นถูก booked ไปกี่ที่เเล้ว
    if zone.SeatSold + zone.PendingHold + quantity > zone.Capacity {
        tx.Rollback()
        return nil, errors.New("zone capacity exceeded")
    }

    //  ถ้าเป็น seating zone จำเป็นต้อง lock และ ตรวจ seat availability 
    if !isStanding {
        var seats []entity.SeatAvailable
        if err := tx.
            Clauses(clause.Locking{Strength: "UPDATE"}). // lock records ไม่อ่านมีการอ่านหรือแก้ไขซ้ำ ป้องกันการเลือกที่นั่งซ้ำ
            Where("id IN (?)", in.SeatIDs).
            Find(&seats).Error; err != nil {
            tx.Rollback()
            return nil, err
        }
        if len(seats) != len(in.SeatIDs) { //เช็คว่าที่ query ไปนั้น == seat_id ที่ส่งมั้ย
            tx.Rollback()
            return nil, ErrSeatNotFound
        }
        // วนลูปเพื่อตรวจสอบ seatId ที่ส่งมานั้น สถานะเป็น available มั้ย (ป้องกันการจองซ้ำ)
        for _, sa := range seats { 
            if strings.ToLower(sa.SeatAvailableStatus) != "available" { // ไม่ใช่ available
                tx.Rollback()
                return nil, ErrSeatAlreadyTaken // ส่ง error ไปว่า ที่นั่งที่เลือกมานั้น มีคนเลือกไปแล้ว 
            }
        }
        // ถ้า seatId ที่ส่งมานั้น สถานะ available ทุกที่นั่ง ให้เป็นสถานะในตาราง seat available เป็น locked และรอการชำระเงิน
        if err := tx.Model(&entity.SeatAvailable{}).
            Where("id IN (?)", in.SeatIDs).
            Update("seat_available_status", "locked").Error; err != nil {
            tx.Rollback()
            return nil, err
        }
    }
    
    // Update PendingHold ของโซนนั้น ให้เพิ่มตาม quantity
    if err := tx.Model(&entity.Zone{}).
        Where("id = ?", in.ZoneID).
        UpdateColumn("pending_hold", gorm.Expr("pending_hold + ?", quantity)).Error; err != nil {
        tx.Rollback()
        return nil, err
    }

    //คำนวณ queue_number (เฉพาะ standing zone) 
    
    queueNumber := 0
    if isStanding { // เฉพาะ standing zone
        //เช็ค SeatSold + PendingHold เพื่อให้ queue กับคนที่กด booking ได้ก่อนจึงบวก PendingHold ด้วย
        queueNumber = int(zone.SeatSold + zone.PendingHold + 1) 
    }

    // Create booking record
    b := entity.Booking{
        UserID:          in.UserID,
        ShowDateID:      in.ShowDateID,
        ZoneID:          in.ZoneID,
        QueueNumber:     queueNumber,
        TotalPrice:      in.TotalPrice,
        BookingStatusID: 1, // frontend ส่ง 1 == pending ก็จริงแต่ให้ชัวร์เลยทำที่ service อีกรอบ
        BookingCode:     code,
        BookingDate:     now,
        ExpiredDate:     exp,
    }
    if err := tx.Create(&b).Error; err != nil {// create record
        tx.Rollback()
        return nil, err
    }

    // ถ้า seating zone → บันทึก booking_seats ด้วย 
    if !isStanding {
        for _, sid := range in.SeatIDs {
            bs := entity.BookingSeat{
                BookingID: b.ID,
                SeatAvailableID:    sid,
                TicketUUID: uuid.New().String(), 
            }
            if err := tx.Create(&bs).Error; err != nil {
                tx.Rollback()
                return nil, err
            }
        }
    }

    if err := tx.Commit().Error; err != nil {
        return nil, err
    }

    // ---- 8) preload เพื่อตอบกลับ ----
    var out entity.Booking
    if err := db.
        Preload("User").
        Preload("ShowDate").
        Preload("Zone").
        Preload("BookingStatus").
        // Preload("BookingSeats.Seat").
        First(&out, b.ID).Error; err != nil {
        return nil, err
    }
    return &out, nil
}

// func สำหรับเช็คหมดอายุ booking 
func (s *BookingService) ExpirePendingBookings() (int, error) {
    db := s.DB
    if db == nil {
        db = connection.DB()
    }
    // status 1 = pending, 4 = expired
    var toExpire []entity.Booking
    if err := db.
        Where("booking_status_id = ? AND expired_date < ?", 1, time.Now()).
        Find(&toExpire).Error; err != nil {
        return 0, err
    }

    cnt := 0 // นับจำนวน booking ที่หมดอายุจริงๆ
    for _, bk := range toExpire {
        tx := db.Begin()

        // lock zone
        if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&entity.Zone{}, bk.ZoneID).Error; err != nil {
            tx.Rollback()
            continue
        }

        // นับจำนวนที่ต้องปล่อย
        quantity := 1
        var countSeats int64
        if err := tx.Model(&entity.BookingSeat{}).
            Where("booking_id = ?", bk.ID).Count(&countSeats).Error; err == nil && countSeats > 0 {
            quantity = int(countSeats)
            // ปลดที่นั่ง locked -> available
            if err := tx.Model(&entity.SeatAvailable{}).
                Where("zone_id = ? AND seat_id IN (?)",
                    bk.ZoneID,
                    tx.Model(&entity.BookingSeat{}).Select("seat_id").Where("booking_id = ?", bk.ID),
                ).
                Update("seat_available_status", "available").Error; err != nil {
                tx.Rollback()
                continue
            }
        }

        // pending_hold--
        if err := tx.Model(&entity.Zone{}).
            Where("id = ?", bk.ZoneID).
            UpdateColumn("pending_hold", gorm.Expr("CASE WHEN pending_hold >= ? THEN pending_hold - ? ELSE 0 END", quantity, quantity)).
            Error; err != nil {
            tx.Rollback()
            continue
        }

        // เปลี่ยน booking → expired (4)
        if err := tx.Model(&entity.Booking{}).
            Where("id = ?", bk.ID).
            Updates(map[string]any{
                "booking_status_id": 4,
            }).Error; err != nil {
            tx.Rollback()
            continue
        }

        if err := tx.Commit().Error; err == nil {
            cnt++
        }
    }
    return cnt, nil
}

func RecalculateZoneCounters(db *gorm.DB, zoneID uint) error {
	return db.Exec(`
		UPDATE zones AS z
		SET
		  seat_sold = (
		    SELECT COALESCE(COUNT(*), 0) FROM seat_availables s
		    WHERE s.zone_id = z.id AND s.seat_available_status = 'booked'
		  ) + (
		    SELECT COALESCE(COUNT(*), 0) FROM bookings b
		    WHERE b.zone_id = z.id AND b.booking_status_id = 2 AND b.queue_number > 0
		    AND NOT EXISTS (SELECT 1 FROM seat_availables WHERE zone_id = z.id)
		  ),
		  pending_hold = (
		    SELECT COALESCE(COUNT(*), 0) FROM seat_availables s
		    WHERE s.zone_id = z.id AND s.seat_available_status = 'locked'
		  ) + (
		    SELECT COALESCE(COUNT(*), 0) FROM bookings b
		    WHERE b.zone_id = z.id AND b.booking_status_id = 1 AND b.queue_number > 0
		    AND NOT EXISTS (SELECT 1 FROM seat_availables WHERE zone_id = z.id)
		  )
		WHERE z.id = ?;
	`, zoneID).Error
}

func RecalculateAllZones(db *gorm.DB) error {
	return db.Exec(`
		UPDATE zones AS z
		SET
		  seat_sold = (
		    SELECT COALESCE(COUNT(*), 0) FROM seat_availables s
		    WHERE s.zone_id = z.id AND s.seat_available_status = 'booked'
		  ) + (
		    SELECT COALESCE(COUNT(*), 0) FROM bookings b
		    WHERE b.zone_id = z.id AND b.booking_status_id = 2 AND b.queue_number > 0
		    AND NOT EXISTS (SELECT 1 FROM seat_availables WHERE zone_id = z.id)
		  ),
		  pending_hold = (
		    SELECT COALESCE(COUNT(*), 0) FROM seat_availables s
		    WHERE s.zone_id = z.id AND s.seat_available_status = 'locked'
		  ) + (
		    SELECT COALESCE(COUNT(*), 0) FROM bookings b
		    WHERE b.zone_id = z.id AND b.booking_status_id = 1 AND b.queue_number > 0
		    AND NOT EXISTS (SELECT 1 FROM seat_availables WHERE zone_id = z.id)
		  );
	`).Error
}


// func อัปเดตสถานะ booking เป็น "paid" และอัปเดตที่นั่ง/โซน
func (s *BookingService) OnPaymentPaid(bookingID uint) error {
    db := s.DB
    if db == nil {
        db = connection.DB()
    }

    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            panic(r)
        }
    }()

    // โหลด booking + LOCK zone
    var bk entity.Booking
    if err := tx.Preload("Zone").First(&bk, bookingID).Error; err != nil {
        tx.Rollback()
        return err
    }
    if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&entity.Zone{}, bk.ZoneID).Error; err != nil {
        tx.Rollback()
        return err
    }

    
    quantity := 1 // ตัวแปรที่บอกถึง จำนวนตั๋วที่จองแล้วต้องอัปเดตสถานะ
    var countSeats int64
    if err := tx.Model(&entity.BookingSeat{}).
        Where("booking_id = ?", bookingID).
        Count(&countSeats).Error; err != nil {
        tx.Rollback()
        return err
    }
    if countSeats > 0 {
        quantity = int(countSeats)
        // เปลี่ยนที่นั่งจาก locked -> booked
        if err := tx.Model(&entity.SeatAvailable{}).
        Where("zone_id = ? AND seat_id IN (?) AND seat_available_status = ?",
            bk.ZoneID,
            tx.Model(&entity.BookingSeat{}).Select("seat_id").Where("booking_id = ?", bookingID),
            "locked",
        ).
        Update("seat_available_status", "booked").Error; err != nil {
        tx.Rollback(); return err
    }
    }

    // อัปเดตโซน: pending_hold-- , seat_sold++
    if err := tx.Model(&entity.Zone{}).
        Where("id = ?", bk.ZoneID).
        Updates(map[string]interface{}{
            "pending_hold": gorm.Expr("CASE WHEN pending_hold >= ? THEN pending_hold - ? ELSE 0 END", quantity, quantity),
            "seat_sold":    gorm.Expr("seat_sold + ?", quantity),
        }).Error; err != nil {
        tx.Rollback()
        return err
    }
    if err := RecalculateZoneCounters(tx, bk.ZoneID); err != nil {
		tx.Rollback()
		return err
	}

    // (ถ้าคุณมี BookingStatusID สำหรับ 'paid') อัปเดต booking ด้วย
    // e.g., 2 = paid
    if err := tx.Model(&entity.Booking{}).
        Where("id = ?", bookingID).
        Update("booking_status_id", 2).
        Error; err != nil {
        tx.Rollback()
        return err
    }
    

    return tx.Commit().Error
}


