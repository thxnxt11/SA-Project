package controllers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
)

// GET /stockmovements - ดึงข้อมูลทั้งหมดพร้อม product และ staff
func GetStockmovements(c *gin.Context) {
    var stock []entity.Stockmovement
    if err := connection.DB().Preload("Product").Preload("Staff").Find(&stock).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, stock)
}

// POST /stockmovements - เพิ่มข้อมูลใหม่
func CreateStockmovement(c *gin.Context) {
    var input struct {
        ProductID uint   `json:"product_id" binding:"required"`
        Adjusted  string `json:"adjusted" binding:"required"`
        Amount    uint8  `json:"amount" binding:"required"`
        StaffID   uint8  `json:"staff_id" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    stock := entity.Stockmovement{
        ProductID: input.ProductID,
        Adjusted:  input.Adjusted,
        Amount:    input.Amount,
        StaffID:   input.StaffID,
    }

    if err := connection.DB().Create(&stock).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, stock)
}

// DELETE /stockmovements/:id - ลบข้อมูล
func DeleteStockmovement(c *gin.Context) {
    idParam := c.Param("id")
    id, err := strconv.Atoi(idParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    if err := connection.DB().Delete(&entity.Stockmovement{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
