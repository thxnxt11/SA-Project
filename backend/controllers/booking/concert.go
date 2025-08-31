// controllers/concert_controller.go
package booking

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
)
type pickconcert struct {
	ID          uint   `json:"id"`
	ConcertName string `json:"concert_name"`
}

func GetAllConcerts(c *gin.Context) {
    concerts, err := services.GetAllConcert()
    if err != nil {
        
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch concerts"})
        return
    }
	c.JSON(http.StatusOK, concerts)
}

func GetConcertByID(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseUint(idStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid concert ID"})
        return
    }

    var concert entity.Concert
    if err := connection.DB().
        Preload("Venue").
        Preload("User").
        Preload("ShowDates.Zones.ZoneType").
        Preload("ShowDates.Zones").
        First(&concert, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Concert not found"})
        return
    }

    c.JSON(http.StatusOK, concert)
}

func GetConcertsByUserID(c *gin.Context) {
    uidStr := c.Param("id")
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
        Find(&rows)

    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, rows)
}



