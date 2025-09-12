package products

import (
	"net/http"
	"time"

	"github.com/yourname/went-back/connection"
	"github.com/gin-gonic/gin"
)

func DeleteVariantById(c *gin.Context) {
	id := c.Param("id")

	db := connection.DB()

	// อัปเดต field deleted_at เป็นเวลาปัจจุบัน
	tx := db.Exec("UPDATE variants SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", time.Now(), id)

	if tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found or already deleted"})
		return
	}

}