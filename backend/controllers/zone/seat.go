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

    // get zone_id and seat_id from path params
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

    // only bind the field we care about
    var body struct {
        SeatAvailableStatus string `json:"seat_available_status" binding:"required"`
    }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON: " + err.Error()})
        return
    }

    // update one seat in one zone
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

}
