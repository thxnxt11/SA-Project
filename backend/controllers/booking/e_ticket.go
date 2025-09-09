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

func (h *ETicketController) GetMyTicketCards(c *gin.Context) {
	UserIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(UserIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	rows, err := h.service.GetETicketByUserId(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rows, "success": true})
}

func (h *ETicketController) GetETicketByShowID(c *gin.Context) {
	userIDStr := c.Param("user_id")
	concertIDStr := c.Param("concert_id")
	showDateIDStr := c.Param("show_date_id")

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID", "success": false})
		return
	}

	concertID, err := strconv.ParseUint(concertIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid concert ID", "success": false})
		return
	}

	showDateID, err := strconv.ParseUint(showDateIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid show date ID", "success": false})
		return
	}

	tickets, err := h.service.GetETicketByShowID(uint(userID), uint(concertID), uint(showDateID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "success": false})
		return
	}

	if len(tickets) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No tickets found", "success": false})
		return
	}

	// ใช้ตั๋วใบแรกเพื่อดึงข้อมูลคอนเสิร์ต
	firstTicket := tickets[0]
	
	response := gin.H{
		"data": gin.H{
			"concert_id":           concertID,
			"show_date_id":         showDateID,
			"date_iso":             firstTicket.ShowTimeISO,
			"title":                firstTicket.ConcertName,
			"venue":                firstTicket.VenueName,
			"concert_poster_url":   firstTicket.Poster,
			"total_tickets":        len(tickets),
			"tickets":              tickets,
		},
		"success": true,
	}

	c.JSON(200, response)
}