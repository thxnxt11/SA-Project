package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
)

func GetSizes(c *gin.Context) {
    var sizes []entity.Size
	if err := connection.DB().Find(&sizes).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	// ส่งออกทั้ง id และ size
	var result []map[string]interface{}
	for _, s := range sizes {
		result = append(result, map[string]interface{}{
			"id":   s.ID,
			"size": s.Size,
		})
	}

	c.JSON(http.StatusOK, result)
}