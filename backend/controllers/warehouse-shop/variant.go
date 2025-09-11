package products

import (
	"net/http"
	"github.com/yourname/went-back/connection"
    // "github.com/yourname/went-back/entity"
	"github.com/gin-gonic/gin"
)

// DELETE /variant/:id
func DeleteVariantById(c *gin.Context) {
	id := c.Param("id")

	if tx := connection.DB().Exec("DELETE FROM variants WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "variant deleted successfully"})
}