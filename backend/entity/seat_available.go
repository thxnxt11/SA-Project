package entity

import "gorm.io/gorm"

type SeatAvailable struct {
    gorm.Model
    ZoneID uint `gorm:"uniqueIndex:idx_zone_seat" json:"zone_id"`
    Zone   *Zone `gorm:"foreignKey:ZoneID" json:"zone"`

    SeatID uint `gorm:"uniqueIndex:idx_zone_seat" json:"seat_id"`
    Seat   *Seat `gorm:"foreignKey:SeatID" json:"seat"`

    SeatAvailableStatus string `gorm:"type:text" json:"seatavailable_status"`
}
