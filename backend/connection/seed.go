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

func SeedSeatAvailable(db *gorm.DB, zoneID uint, limit int) {
	var seats []entity.Seat
	db.Find(&seats)

	if len(seats) > limit {
		seats = seats[:limit]
	}

	var seatAvailables []entity.SeatAvailable
	for _, seat := range seats {
		seatAvailables = append(seatAvailables, entity.SeatAvailable{
			ZoneID:              zoneID,
			SeatID:              seat.ID,
			SeatAvailableStatus: "available",
		})
	}

	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "zone_id"}, {Name: "seat_id"}},
		DoNothing: true,
	}).Create(&seatAvailables).Error
	if err != nil {
		log.Fatalf("SeedSeatAvailable error: %v", err)
	}

	fmt.Printf("✅ SeatAvailable created for zone %d (%d records)\n", zoneID, len(seatAvailables))
}