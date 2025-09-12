package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
)

type EquipmentController struct {
	Service *services.EquipmentService
}

// ---------------- CRUD ----------------

// GET /equipments
func (c *EquipmentController) GetAllEquipment(ctx *gin.Context) {
	eq, err := c.Service.GetAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, eq)
}

// GET /equipments/:id
func (c *EquipmentController) GetEquipmentByID(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)
	eq, err := c.Service.GetByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, eq)
}

// POST /equipments
func (c *EquipmentController) Create(ctx *gin.Context) {
	var eq entity.Equipment
	if err := ctx.ShouldBindJSON(&eq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := c.Service.Create(&eq); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, eq)
}

// PUT /equipments/:id
func (c *EquipmentController) Update(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)
	var eq entity.Equipment
	if err := ctx.ShouldBindJSON(&eq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	eq.ID = uint(id)
	if err := c.Service.Update(&eq); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, eq)
}

// DELETE /equipments/:id
func (c *EquipmentController) Delete(ctx *gin.Context) {
	id, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err := c.Service.Delete(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// ---------------- Stock / Stage Assignment ----------------

// POST /equipments/:id/assign
func (c *EquipmentController) AssignToStage(ctx *gin.Context) {
	stageID, _ := strconv.ParseUint(ctx.Query("stage_id"), 10, 64)
	eqID, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	var body struct {
		Quantity uint `json:"quantity"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.Service.AssignToStage(uint(stageID), uint(eqID), body.Quantity); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "equipment assigned"})
}

// GET /equipments/available?stage_id=1
func (c *EquipmentController) GetAvailableByStage(ctx *gin.Context) {
	stageID, _ := strconv.ParseUint(ctx.Query("stage_id"), 10, 64)
	eq, err := c.Service.GetAvailableByStage(uint(stageID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, eq)
}


func (c *EquipmentController) GetEquipmentTypes(ctx *gin.Context) {
    types, err := c.Service.GetEquipmentTypes()
    if err != nil {
        ctx.JSON(500, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(200, types)
}
