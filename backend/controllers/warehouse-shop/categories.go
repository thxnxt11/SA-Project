package products

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
)

func GetCategories(c *gin.Context) {
    var categories []entity.Category
    if err := connection.DB().Find(&categories).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, categories)
}