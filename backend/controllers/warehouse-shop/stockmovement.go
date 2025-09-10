package products

import (
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

// GET /stockmovements - ดึงข้อมูลทั้งหมดพร้อม product และ staff
func GetStockMovements(c *gin.Context) {
    db := connection.DB()

    var movements []entity.StockMovement
    if err := db.Preload("Staff").
        Preload("Variant").
        Preload("Variant.Product").
        Preload("Variant.Color").
        Preload("Variant.Size").
        Preload("Action").
        Order("updated_at desc").
        Find(&movements).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var response []map[string]interface{}
    for _, m := range movements {
        productName := ""
        // total := uint(0)
        variantName := ""
        quantity := uint(0)
        if m.Variant != nil {
            if m.Variant.Product != nil {
                productName = m.Variant.Product.ProductName
                // total = m.Variant.Product.Total
            }
            colorName := ""
            sizeName := ""
            if m.Variant.Color != nil {
                colorName = m.Variant.Color.Color
            }
            if m.Variant.Size != nil {
                sizeName = m.Variant.Size.Size
            }
            variantName = colorName + " - " + sizeName
            quantity = m.Variant.Quantity
        }

        staffName := ""
        if m.Staff != nil {
            staffName = m.Staff.FirstName + " " + m.Staff.LastName
        }

        actionName := ""
        if m.Action != nil {
            actionName = m.Action.Action
        }

        response = append(response, map[string]interface{}{
            "id":           m.ID,
            "variant_id":   m.VariantID,
            "product_name": productName,
            "variant_name": variantName,
            "amount":       m.Amount,
            "updated":      actionName,
            "quantity":     quantity,
            "staff_name":   staffName,
            "updated_at":   m.UpdatedAt,
        })
    }

    c.JSON(http.StatusOK, response)
}

func CreateStockMovement(db *gorm.DB, variantID, amount, staffID, actionID uint) error {
    sm := entity.StockMovement{
        VariantID: variantID,
        Amount:    amount,
        StaffID:   staffID,
        ActionID:  actionID,
    }
    return db.Create(&sm).Error
}
