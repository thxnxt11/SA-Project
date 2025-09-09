package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

// GetConcertByID ดึงคอนเสิร์ตพร้อม ShowDates, Venue, User
func GetConcertByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง ID จาก URL
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid concert ID"})
			return
		}

		var concert entity.Concert
		// ดึง Concert พร้อม ShowDates, Venue, User
		if err := db.Preload("Venue").
			Preload("User").
			Preload("ShowDates").
			Preload("ShowDates.Venue"). // preload venue ของแต่ละ showdate
			First(&concert, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "concert not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, concert)
	}
}
