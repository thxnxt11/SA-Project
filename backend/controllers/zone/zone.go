package zone

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"


	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/connection"
)

type pickconcert struct {
	ID          uint   `json:"id"`
	ConcertName string `json:"concert_name"`
}

type pickZoneType struct {
	ID       uint   `json:"id"`
	ZoneType string `json:"zone_type"`
}


func GetConcertsByUserID(c *gin.Context) {
    uidStr := c.Param("user_id")
    uid, err := strconv.Atoi(uidStr)
    if err != nil || uid <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
        return
    }

    var rows []pickconcert
    tx := connection.DB().
        Model(&entity.Concert{}).
        Select("id, concert_name").
        Where("user_id = ?", uid).
        Order("id DESC"). 
        Find(&rows)

    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, rows)
}

func GetShowDatesByConcertID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid concert id"})
		return
	}

	var rows []entity.ShowDate
	tx := connection.DB().
		Where("concert_id = ?", id).

		Order("show_date ASC").
		Find(&rows)

	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}


	c.JSON(http.StatusOK, rows)
}

func GetZonesByShowDateID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid showdate id"})
		return
	}

	var zones []entity.Zone
	tx := connection.DB().
		Where("show_date_id = ?", id).
		Preload("ZoneType").
		Preload("Venue").
		Preload("Seats").
		Order("id ASC").
		Find(&zones)

	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
		return
	}


	c.JSON(http.StatusOK, zones)
}


func AddZone(c *gin.Context) {
	db := connection.DB()

	var body entity.Zone
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	// basic validation (tune as you like)
	if body.ShowDateID == 0 || body.VenueID == 0 || body.ZoneName == "" || body.ZoneTypeID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing required fields"})
		return
	}

	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert zone: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

func DeleteZone(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	tx := db.Delete(&entity.Zone{}, id)
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed: " + tx.Error.Error()})
		return
	}
	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Zone not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Zone deleted"})
}

func UpdateZone(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var body entity.Zone
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// NOTE: Select forces these columns to update even if zero-values
	if err := db.Model(&entity.Zone{}).
		Where("id = ?", id).
		Select(
			"show_date_id",
			"venue_id",
			"zone_name",
			"zone_type_id",
			"zone_price",
			"capacity",
			"seat_sold",
			"pending_hold",
		).
		Updates(body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// return the updated row (with useful relations)
	var out entity.Zone
	if err := db.
		Preload("Venue").
		Preload("ZoneType").
		Preload("ShowDate").
		First(&out, id).Error; err == nil {
		c.JSON(http.StatusOK, out)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Zone updated"})
}

func ListZoneTypes(c *gin.Context) {
	var rows []pickZoneType
	if err := connection.DB().
		Model(&entity.ZoneType{}).
		Select("id, zone_type").
		Order("zone_type ASC").
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rows) // [] even if empty
}
