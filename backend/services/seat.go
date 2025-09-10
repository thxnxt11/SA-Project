package services

import (
	"errors"
	"fmt"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type SeatService struct {
	DB *gorm.DB
}
type GenerateSeat struct {
	VenueID   uint `json:"venue_id"`
	TotalSeat int  `json:"total_seat"`
}

func rowLabel(n int) string {
	s := ""
	for n > 0 {
		n--
		s = string(rune('A' + (n % 26))) + s
		n /= 26
	}
	return s
}

func (s *SeatService)GenerateSeatForVenue(in GenerateSeat)([]entity.Seat,error){
	if in.VenueID == 0{
		return nil,errors.New("venue_id id required")
	}
	if in.TotalSeat <= 0{
		return nil,errors.New("total_seat must be more then zero")
	}
	if in.TotalSeat%15 != 0{
		return nil,errors.New("total_seat must be divisible by 15")
	}

	var existing int64
	if err := s.DB.Model(&entity.Seat{}).Where("venue_id = ?",in.VenueID).Count(&existing).Error; err != nil{ 
		return nil,err
	}
	if existing > 0 {
		return nil, fmt.Errorf("seats for venue_id=%d already exist (%d records)", in.VenueID, existing)
	}
	rows := in.TotalSeat/15
	seats := make([]entity.Seat,0,in.TotalSeat)

	rowNum := 1
	crested := 0
	for r := 0; r < rows;r++{
		label := rowLabel(rowNum)
		for c := 1; c <= 15;c++{
			code := fmt.Sprintf("%s%d",label,c)
			seats = append(seats,entity.Seat{
				VenueID: in.VenueID,
				SeatCode: code,
			})
			crested++
		}
		rowNum++
	}
	if err := s.DB.Transaction(func(tx *gorm.DB) error {
		return tx.CreateInBatches(&seats, 300).Error
	}); err != nil {
		return nil, err
	}
	return seats,nil
}