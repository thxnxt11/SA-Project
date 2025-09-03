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

	if(err != nil){
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	

	var seats []entity.SeatAvailable


	for i := 1; i <= 285; i++{
		seat := entity.SeatAvailable{
			ZoneID : uint(zid), 
			SeatID: uint(i), 
			SeatAvailableStatus: "available",
			}
		seats = append(seats, seat)
	}
	db := connection.DB()
	if err := db.Create(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert showdate: " + err.Error()})
		return
	}
}

func Deleteseatzone(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := db.Where("zone_id = ?", id).Delete(&entity.SeatAvailable{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "seat on that zone  deleted"})
}

func GetseatzonesByzoneID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid zonetype id"})
		return
	}

	var zones []entity.SeatAvailable
	tx := connection.DB().
		Where("zone_id = ?", id).
		Preload("Seat").
		Order("id ASC").
		Find(&zones)

	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}


	c.JSON(http.StatusOK, zones)
}

func UpdateSeatzone(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var body entity.SeatAvailable
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// NOTE: Select forces these columns to update even if zero-values
	if err := db.Model(&entity.SeatAvailable{}).
		Where("id = ?", id).
		Select(
			"seat_available_status",
		).
		Updates(body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	

	c.JSON(http.StatusOK, gin.H{"message": "Zone updated"})
}