package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/service/showdate"
)

type ShowDateController struct {
	Service *service.ShowDateService
}

// GET /showdates
func (ctrl *ShowDateController) GetShowDates(c *gin.Context) {
	showdates, err := ctrl.Service.GetAllShowDates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, showdates)
}

// GET /showdates/:id
func (ctrl *ShowDateController) GetShowDate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid showdate id"})
		return
	}

	showdate, err := ctrl.Service.GetShowDateByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ShowDate not found"})
		return
	}
	c.JSON(http.StatusOK, showdate)
}
