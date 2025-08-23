package concert

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

func GetAllConcerts(c *gin.Context) {
	db := connection.DB()

	var concerts []entity.Concert
	
	if err := db.Preload("Venue").Find(&concerts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch concerts"})
		return
	}

	c.JSON(http.StatusOK, concerts)
}