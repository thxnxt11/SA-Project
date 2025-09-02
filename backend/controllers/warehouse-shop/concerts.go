// controllers/concert_controller.go
package controllers

import (
	"net/http"
	"strconv"
	"github.com/yourname/went-back/connection"
	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/entity"
    "github.com/yourname/went-back/services"
)

func GetAllConcerts(c *gin.Context) {
    concert, err := services.GetAllConcert()
    if err != nil {
        
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch concerts"})
        return
    }
	c.JSON(http.StatusOK, concert)
}
func GetConcerts(c *gin.Context) {
    var concert []entity.Concert
    if err := connection.DB().Find(&concert).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, concert)
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

// func GetZonesAvailableByShowDate(c *gin.Context) {
//     idStr := c.Param("id")
//     id, err := strconv.ParseUint(idStr, 10, 64)
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid showdate ID"})
//         return
//     }

//     var zones []entity.Zone
//     if err := connection.DB().
//         Preload("ZoneType").
//         Preload("Venue").
//         Preload("Seats").              // โหลดที่นั่งที่สัมพันธ์กับ Zone
//         Preload("Seats.Seat").         // โหลดข้อมูล seat จริง ๆ
//         Where("show_date_id = ?", id).
//         Find(&zones).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }

//     c.JSON(http.StatusOK, zones)
// }