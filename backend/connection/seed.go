package connection

import (
	"fmt"
	"log"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func SeedSeats(venueID uint, rows []string, perRow int) {
    for _, r := range rows {
        for i := 1; i <= perRow; i++ {
            code := fmt.Sprintf("%s%d", r, i) // เช่น "A1", "A2"
            seat := entity.Seat{VenueID: venueID, SeatCode: code}

            // ใช้ OnConflict DoNothing กันซ้ำ
            DB().Clauses(clause.OnConflict{DoNothing: true}).Create(&seat)
        }
    }
}

func SeedSeatAvailable(db *gorm.DB) {
    zoneID := uint(8)

    var seats []entity.Seat
    db.Find(&seats)

    if len(seats) == 0 {
        log.Println("⚠️ ไม่มี seats ใน database, กรุณารัน SeedSeats ก่อน")
        return
    }

    var seatAvailables []entity.SeatAvailable
    for _, seat := range seats {
        seatAvailables = append(seatAvailables, entity.SeatAvailable{
            ZoneID:              zoneID,
            SeatID:              seat.ID,
            SeatAvailableStatus: "available",
        })
    }

    if len(seatAvailables) == 0 {
        log.Println("⚠️ ไม่มี seatAvailables ให้ insert")
        return
    }

    err := db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "zone_id"}, {Name: "seat_id"}},
        DoNothing: true,
    }).Create(&seatAvailables).Error

    if err != nil {
        log.Fatalf("SeedSeatAvailable error: %v", err)
    }

    fmt.Println("✅ SeatAvailable created")
}
