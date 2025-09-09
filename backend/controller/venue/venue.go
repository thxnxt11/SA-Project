package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/service/venue"
)

type VenueController struct {
	VenueService *service.VenueService
}

// ---------------- CRUD Venue ----------------

// GET /api/venues
func (ctrl *VenueController) GetAllVenues(c *gin.Context) {
	venues, err := ctrl.VenueService.GetAllVenues()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, venues)
}

// GET /api/venues/:id
func (ctrl *VenueController) GetVenue(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid venue ID"})
		return
	}

	venue, err := ctrl.VenueService.GetVenueByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "venue not found"})
		return
	}

	c.JSON(http.StatusOK, venue)
}

// POST /api/venues
func (ctrl *VenueController) CreateVenue(c *gin.Context) {
	var v entity.Venue
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.VenueService.CreateVenueWithStages(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, v)
}

// PUT /api/venues/:id
func (ctrl *VenueController) UpdateVenue(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid venue ID"})
		return
	}

	var v entity.Venue
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.VenueService.UpdateVenueWithStages(uint(id), &v); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, v)
}

// DELETE /api/venues/:id
func (ctrl *VenueController) DeleteVenue(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid venue ID"})
		return
	}

	if err := ctrl.VenueService.DeleteVenue(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// DELETE /api/stages/:id
func (ctrl *VenueController) DeleteStage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid stage ID"})
		return
	}

	if err := ctrl.VenueService.DeleteStage(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// ---------------- Types ----------------

// GET /api/venuetypes
func (ctrl *VenueController) GetVenueTypes(c *gin.Context) {
	types, err := ctrl.VenueService.GetVenueTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

// GET /api/stagetypes
func (ctrl *VenueController) GetStageTypes(c *gin.Context) {
	types, err := ctrl.VenueService.GetStageTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

// GET /api/equipmenttypes
func (ctrl *VenueController) GetEquipmentTypes(c *gin.Context) {
	types, err := ctrl.VenueService.GetEquipmentTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}
