package zone

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

func Addseatzone(c *gin.Context) {
	zid, err := strconv.Atoi(c.Param("id"))
	if err != nil || zid <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid zone id"})
		return
	}

	db := connection.DB()

	// prevent duplicate seeding
	var existing int64
	if err := db.Model(&entity.SeatAvailable{}).
		Where("zone_id = ?", zid).
		Count(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "count failed: " + err.Error()})
		return
	}
	if existing > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "seats already exist for this zone"})
		return
	}

	// ดึง zone เพื่อตามหา showdate และ venue_id
	var zone entity.Zone
	if err := db.Preload("ShowDate").First(&zone, zid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "zone not found"})
		return
	}
	venueID := zone.ShowDate.VenueID

	// ดึง seat ที่ venue_id ตรงกับ showdate.venue_id
	var seats []entity.Seat
	if err := db.Where("venue_id = ?", venueID).Find(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get seats: " + err.Error()})
		return
	}
	if len(seats) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no seats found for this venue"})
		return
	}

	seatAvailables := make([]entity.SeatAvailable, 0, len(seats))
	for _, seat := range seats {
		seatAvailables = append(seatAvailables, entity.SeatAvailable{
			ZoneID:              uint(zid),
			SeatID:              seat.ID,
			SeatAvailableStatus: "available",
		})
	}

	if err := db.Create(&seatAvailables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert seats: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"inserted": len(seatAvailables)})
}

func Deleteseatzone(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid zone id"})
		return
	}

	tx := db.Where("zone_id = ?", id).Delete(&entity.SeatAvailable{})
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed: " + tx.Error.Error()})
		return
	}
	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no seats found for this zone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "seats for this zone deleted", "deleted": tx.RowsAffected})
}

func GetseatzonesByzoneID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid zone id"})
		return
	}

	var rows []entity.SeatAvailable
	tx := connection.DB().
		Where("zone_id = ?", id).
		Preload("Seat").
		Order("id ASC").
		Find(&rows)

	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, rows)
}

func UpdateSeatzone(c *gin.Context) {
	db := connection.DB()

	zoneID, err := strconv.Atoi(c.Param("id"))
	if err != nil || zoneID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid zone id"})
		return
	}

	seatID, err := strconv.Atoi(c.Param("seat_id"))
	if err != nil || seatID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid seat id"})
		return
	}


	var body struct {
		SeatAvailableStatus string `json:"seatavailable_status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON: " + err.Error()})
		return
	}

	tx := db.Model(&entity.SeatAvailable{}).
		Where("zone_id = ? AND seat_id = ?", zoneID, seatID).
		Update("seat_available_status", body.SeatAvailableStatus)

	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}
	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "seat not found for that zone"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": tx.RowsAffected})
}
