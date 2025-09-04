package controllers

import (
    "net/http"
    // "strconv"

    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
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
        total := uint(0)
        variantName := ""
        if m.Variant != nil {
            if m.Variant.Product != nil {
                productName = m.Variant.Product.ProductName
                total = m.Variant.Product.Total
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
            "variant_id":   m.VariantID,
            "product_name": productName,
            "variant_name": variantName,
            "amount":       m.Amount,
            "updated":      actionName,
            "total":        total,
            "staff_name":   staffName,
            "updated_at":   m.UpdatedAt,
        })
    }

    c.JSON(http.StatusOK, response)
}




// POST /stockmovements - เพิ่มข้อมูลใหม่
// func CreateStockmovement(c *gin.Context) {
//     var input struct {
//         ProductID uint   `json:"product_id" binding:"required"`
//         ActionID  uint8 `json:"acton_id" binding:"required"`
//         Amount    uint8  `json:"amount" binding:"required"`
//         StaffID   uint8  `json:"staff_id" binding:"required"`
//     }

//     if err := c.ShouldBindJSON(&input); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }

//     stock := entity.Stockmovement{
//         ProductID: input.ProductID,
//         ActionID:  input.ActionID,
//         Amount:    input.Amount,
//         StaffID:   input.StaffID,
//     }

//     if err := connection.DB().Create(&stock).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }

//     c.JSON(http.StatusCreated, stock)
// }

// DELETE /stockmovements/:id - ลบข้อมูล
// func DeleteStockmovement(c *gin.Context) {
//     idParam := c.Param("id")
//     id, err := strconv.Atoi(idParam)
//     if err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
//         return
//     }

//     if err := connection.DB().Delete(&entity.Stockmovement{}, id).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }

//     c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
// }
