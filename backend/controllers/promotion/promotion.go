package promotion

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
	"gorm.io/gorm"
)
type PromotionController struct{
	DB *gorm.DB
}
func GetPromotionByID(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseUint(idStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
        return
    }

    var promotion entity.Promotion
    result := connection.DB().
        Preload("PromotionType").
        Preload("User").
        Preload("Concert").
        First(&promotion, uint(id))
    
    if result.Error != nil {
        fmt.Printf("Error fetching promotion ID %d: %v\n", id, result.Error)
        c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
        return
    }

    fmt.Printf("Successfully fetched promotion ID %d: %+v\n", id, promotion)
    c.JSON(http.StatusOK, gin.H{"data": promotion})
}

// GET /promotion - แก้ไขให้ใช้ service function
func GetAllPromotions(c *gin.Context) {
    promotions, err := services.GetAllPromotions()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch promotions", "details": err.Error()})
        return
    }
    c.JSON(http.StatusOK, promotions)
}

// POST /promotions/add
func CreatePromotion(c *gin.Context) {
    var promo entity.Promotion
	var promoService = &services.PromotionService{DB: connection.DB()}
    if err := c.ShouldBindJSON(&promo); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    createdPromo, err := promoService.CreatePromotion(&promo)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Create failed", "details": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, createdPromo)
}

// PUT /promotions/:id - แก้ไขให้ return ข้อมูลที่ update แล้วพร้อม relations
func UpdatePromotion(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var promo entity.Promotion
	if err := connection.DB().First(&promo, uint(id)).Error; err != nil {
		fmt.Println("DB Error:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}

	var input entity.Promotion
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.ID = promo.ID
	input.UpdatedAt = time.Now()

	if err := connection.DB().Model(&promo).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	// แก้ไข: ดึงข้อมูลที่ update แล้วพร้อม relations
	var updatedPromo entity.Promotion
	if err := connection.DB().
		Preload("PromotionType").
		Preload("CreateBy").
		Preload("Concert").
		First(&updatedPromo, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated promotion"})
		return
	}

	c.JSON(http.StatusOK, updatedPromo)
}

// DELETE /promotions/:id
// ===== CONTROLLER - เพิ่ม Debug ให้ละเอียด =====
func DeletePromotion(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var existingPromo entity.Promotion
	result := connection.DB().First(&existingPromo, uint(id))
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		return
	}

	// ลบแบบ hard delete
	deleteResult := connection.DB().Unscoped().Delete(&existingPromo)
	if deleteResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}
	fmt.Printf("Rows affected: %d\n", deleteResult.RowsAffected)
	
	var countAfter int64
	connection.DB().Model(&entity.Promotion{}).Count(&countAfter)
	fmt.Printf("Count after delete: %d\n", countAfter)

	c.JSON(http.StatusOK, gin.H{"message": "Promotion deleted successfully"})
}

func GetAllPromotionTypes(c *gin.Context) {
    var promotionTypes []entity.PromotionType
    if err := connection.DB().Find(&promotionTypes).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch promotion types"})
        return
    }

    var formattedTypes []gin.H
    for _, pt := range promotionTypes {
        formattedTypes = append(formattedTypes, gin.H{
            "id":        pt.ID,
            "promotion_type": pt.PromotionType, 
        })
    }

    c.JSON(http.StatusOK, formattedTypes)
}

func GetAllConcerts(c *gin.Context) {
    concerts, err := services.GetAllConcert()
    if err != nil {
        
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch concerts"})
        return
    }
	c.JSON(http.StatusOK, concerts)
}

