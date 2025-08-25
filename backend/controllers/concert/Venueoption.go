package concert


import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

type pickvenue struct {
	ID        uint   `json:"id"`
	VenueName string `json:"venue_name"`
}

func GetAllVenues(c *gin.Context) {

	
	var  vn []pickvenue

	if err := connection.DB().
		Model(&entity.Venue{}).
		Select("id, venue_name").
		Order("venue_name").
		Find(&vn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, vn)
}
