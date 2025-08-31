package booking

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/services"
)

type ETicketController struct {
	service *services.ETicketservice
}

func NewEticketController() *ETicketController{
	return &ETicketController{
		service: services.NewETicketService(),
	}
}

func (h *ETicketController) GetETicketByBookingID(c *gin.Context){
	bookingIDStr := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID",})
		return
	}
	
	etickets, err := h.service.GetETicketByBookingID(uint(bookingID))
	if err != nil {
		// if err.Error() == "no tickets found for this booking" {
		// 	c.JSON(http.StatusNotFound, gin.H{"error": err.Error(),})
		// 	return
		// }
		if err.Error() == "tickets are not paid or invalid" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error(),})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    etickets,
	})
}