package controller

import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/service/venue"
)
type EquipmentController struct {
    EquipmentService *service.EquipmentService
}

func (c *EquipmentController) GetAll(ctx *gin.Context) {
    equipments, err := c.EquipmentService.GetAll()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusOK, equipments)
}

func (c *EquipmentController) GetByID(ctx *gin.Context) {
    idStr := ctx.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    eq, err := c.EquipmentService.GetByID(uint(id))
    if err != nil {
        ctx.JSON(http.StatusNotFound, gin.H{"error": "Equipment not found"})
        return
    }
    ctx.JSON(http.StatusOK, eq)
}

func (c *EquipmentController) Create(ctx *gin.Context) {
    var eq entity.Equipment
    if err := ctx.ShouldBindJSON(&eq); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := c.EquipmentService.Create(&eq); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusCreated, eq)
}

func (c *EquipmentController) Update(ctx *gin.Context) {
    idStr := ctx.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    var eq entity.Equipment
    if err := ctx.ShouldBindJSON(&eq); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    eq.ID = uint(id)

    if err := c.EquipmentService.Update(&eq); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusOK, eq)
}

func (c *EquipmentController) Delete(ctx *gin.Context) {
    idStr := ctx.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    if err := c.EquipmentService.Delete(uint(id)); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusOK, gin.H{"message": "Equipment deleted"})
}
