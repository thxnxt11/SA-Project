package controllers

import (
	"net/http"
	"github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
	"github.com/gin-gonic/gin"
)

// GET /product/:id
func FindProductById(c *gin.Context) {
	id := c.Param("id")
	var product entity.Product
	
	if tx := connection.DB().Preload("Variants").Where("id = ?", id).First(&product); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	
	c.JSON(http.StatusOK, product)
}
	
// GET /products
func FindProducts(c *gin.Context) {
	var products []entity.Product
	db := connection.DB()

	if err := db.Preload("Category").           // ดึง Category ของ Product
					Preload("Concert").            // ดึง Concert ของ Product
					Preload("Variants.Color").     // ดึง Color ของแต่ละ Variant
					Preload("Variants.Size").      // ดึง Size ของแต่ละ Variant
					Find(&products).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}


// POST /products
type ProductPayload struct {
    ProductName string           `json:"product_name"`
    CategoryID  uint             `json:"category_id"`
    ProductDetail string         `json:"product_detail"`
    ProductPrice uint            `json:"product_price"`
    Minimum     uint             `json:"minimum"`
    ConcertID   *uint            `json:"concert_id"`
    StaffID     uint             `json:"staff_id"` // <-- เพิ่มตรงนี้
    Variants    []entity.Variant `json:"variants"`
}

// POST /products
func CreateProduct(c *gin.Context) {
    var payload ProductPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
        return
    }

    db := connection.DB()

    // ตรวจสอบ Category
    var category entity.Category
    if tx := db.Where("id = ?", payload.CategoryID).First(&category); tx.RowsAffected == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "category id not found"})
        return
    }

    // สร้าง Product พร้อม Variants
    product := entity.Product{
        ProductName:   payload.ProductName,
        CategoryID:    payload.CategoryID,
        ProductDetail: payload.ProductDetail,
        ProductPrice:  float32(payload.ProductPrice),
        Minimum:       payload.Minimum,
        Variants:      payload.Variants,
    }
    if payload.ConcertID != nil {
        product.ConcertID = *payload.ConcertID
    }

    if err := db.Create(&product).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // สร้าง StockMovement สำหรับแต่ละ Variant
    for _, v := range product.Variants {
        sm := entity.StockMovement{
            VariantID: v.ID,
            Amount:    v.Quantity,
            StaffID:   payload.StaffID,
            ActionID:  1, // 1 = เพิ่ม
        }
        if err := db.Create(&sm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    // อัปเดต total ของ Product
    if err := UpdateProductTotal(product.ID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "created successful",
        "data":    product,
    })
}

// PUT /product/:id
func UpdateProduct(c *gin.Context) {
    id := c.Param("id")
    var payload ProductPayload

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
        return
    }

    db := connection.DB()

    var product entity.Product
    if tx := db.Preload("Variants").Where("id = ?", id).First(&product); tx.RowsAffected == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "product not found"})
        return
    }

    // อัปเดต Product fields
    product.ProductName = payload.ProductName
    product.CategoryID = payload.CategoryID
    product.ProductDetail = payload.ProductDetail
    product.ProductPrice = float32(payload.ProductPrice)
    product.Minimum = payload.Minimum
    if payload.ConcertID != nil {
        product.ConcertID = *payload.ConcertID
    }
    if err := db.Save(&product).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // อัปเดต/สร้าง Variants + StockMovement
    for _, v := range payload.Variants {
        v.ProductID = product.ID
        var oldVariant entity.Variant

        if v.ID != 0 {
            // โหลด variant เดิม
            db.Where("id = ? AND product_id = ?", v.ID, product.ID).First(&oldVariant)
            db.Model(&entity.Variant{}).Where("id = ?", v.ID).Updates(v)

            // เช็คจำนวนเปลี่ยนแปลง
            diff := int(v.Quantity) - int(oldVariant.Quantity)
            if diff != 0 {
                actionID := uint(2) // decrease
                if diff > 0 {
                    actionID = 1 // increase
                }
                sm := entity.StockMovement{
                    VariantID: v.ID,
                    Amount:    uint(abs(diff)),
                    StaffID:   payload.StaffID,
                    ActionID:  actionID,
                }
                db.Create(&sm)
            }
        } else {
            // สร้าง variant ใหม่
            db.Create(&v)
            // สร้าง StockMovement เพิ่ม
            sm := entity.StockMovement{
                VariantID: v.ID,
                Amount:    v.Quantity,
                StaffID:   payload.StaffID,
                ActionID:  1,
            }
            db.Create(&sm)
        }
    }

    // อัปเดต total ของ Product
    if err := UpdateProductTotal(product.ID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "updated successful",
        "data":    product,
    })
}

// ฟังก์ชันช่วยสำหรับ abs
func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}


// DELETE /product/:id
func DeleteProductById(c *gin.Context) {
	id := c.Param("id")

	if tx := connection.DB().Exec("DELETE FROM products WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// ลบ variants ด้วย (optional ถ้าใช้ foreign key cascade อาจไม่ต้อง)
	connection.DB().Exec("DELETE FROM variants WHERE product_id = ?", id)

	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}

func UpdateProductTotal(productID uint) error {
	var total int64
	db := connection.DB()
	db.Model(&entity.Variant{}).
		Where("product_id = ?", productID).
		Select("SUM(quantity)").Scan(&total)

	return db.Model(&entity.Product{}).
		Where("id = ?", productID).
		Update("total", total).Error
}