package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
)

func GetColors(c *gin.Context) {
    var color []entity.Color
    if err := connection.DB().Find(&color).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, color)
}