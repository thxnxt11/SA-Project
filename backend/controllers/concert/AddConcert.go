package concert

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

func AddConcert(c *gin.Context) {
	db := connection.DB()

	var newConcert entity.Concert
	if err := c.ShouldBindJSON(&newConcert); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	if err := db.Create(&newConcert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert concert: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newConcert)
}

func DeleteConcert(c *gin.Context) {
	db := connection.DB()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := db.Where("id = ?", id).Delete(&entity.Concert{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Concert deleted"})
}

func UpdateConcert(c *gin.Context) {
    db := connection.DB()

    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }


    var body entity.Concert
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
        return
    }


    if err := db.Model(&entity.Concert{}).
        Where("id = ?", id).
        Select("ConcertName", "Artist", "OnsaleDate", "OffsaleDate", "Poster", "ChartImage", "VenueID", "UserID").
        Updates(body).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var out entity.Concert
    if err := db.Preload("Venue").First(&out, id).Error; err == nil {
        c.JSON(http.StatusOK, out)
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Concert updated"})
}
