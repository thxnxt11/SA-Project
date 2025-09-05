package booking

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/services"
)

type ZoneController struct {
	svc *services.ZoneService
}

func NewZoneController(s *services.ZoneService) *ZoneController {
	return &ZoneController{svc: s}
}

func (h *ZoneController) GetZonesAvailableByShowDate(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "INVALID_SHOWDATE_ID",
			"message": "missing showdate id",
		})
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "INVALID_SHOWDATE_ID",
			"message": "showdate id must be a positive integer",
		})
		return
	}

	zones, err := h.svc.GetZonesAvailableByShowDateID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "FAILED_TO_FETCH_ZONES",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(zones),
		"data":    zones,
	})
}
