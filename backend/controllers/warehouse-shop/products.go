package controllers

import (
	"net/http"
	"github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/entity"
	"github.com/gin-gonic/gin"
)

// POST /products
type CreateProductPayload struct {
    ProductName string           `json:"product_name"`
    CategoryID  uint             `json:"category_id"`
    ProductDetail string         `json:"product_detail"`
    ProductPrice uint            `json:"product_price"`
    Minimum     uint             `json:"minimum"`
    ConcertID   *uint            `json:"concert_id"`
    StaffID     uint             `json:"staff_id"` // <-- เพิ่มตรงนี้
    Variants    []entity.Variant `json:"variants"`
}

func CreateProduct(c *gin.Context) {
    var payload CreateProductPayload
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

    // สร้าง Product
	product := entity.Product{
		ProductName: payload.ProductName,
		CategoryID:  payload.CategoryID,
		ProductDetail: payload.ProductDetail,
		ProductPrice: float32(payload.ProductPrice),
		Minimum: payload.Minimum,
	}

	if payload.ConcertID != nil {
		product.ConcertID = *payload.ConcertID
	}
	product.Variants = payload.Variants

	if err := db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// สร้าง StockMovement
	for _, v := range product.Variants {
		sm := entity.StockMovement{
			ProductID: product.ID,
			Amount:    v.Quantity,
			StaffID:   payload.StaffID,
			ActionID:  1, // กำหนด ActionID เป็น 1  คือ เพิ่ม
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

    c.JSON(http.StatusCreated, product)
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

// PUT /product/:id
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		ProductName   string     `json:"product_name"`
		CategoryID    uint       `json:"category_id"`
		ProductDetail string     `json:"product_detail"`
		ProductPrice  float32    `json:"product_price"`
		Minimum       uint       `json:"minimum"`
		ConcertID     uint       `json:"concert_id"`
		Variants      []entity.Variant `json:"variants"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()

	// ตรวจสอบ product มีอยู่จริงไหม
	var product entity.Product
	if tx := db.Preload("Variants").Where("id = ?", id).First(&product); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product not found"})
		return
	}

	// อัปเดต field ของ product
	product.ProductName = body.ProductName
	product.CategoryID = body.CategoryID
	product.ProductDetail = body.ProductDetail
	product.ProductPrice = body.ProductPrice
	product.Minimum = body.Minimum
	product.ConcertID = body.ConcertID
	if err := db.Save(&product).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดต/สร้าง variants ใหม่
	for _, v := range body.Variants {
		v.ProductID = product.ID
		if v.ID != 0 {
			// อัปเดต variant เดิม
			db.Model(&entity.Variant{}).Where("id = ? AND product_id = ?", v.ID, product.ID).Updates(v)
		} else {
			// สร้าง variant ใหม่
			db.Create(&v)
		}
	}

	// อัปเดต total
	UpdateProductTotal(product.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "updated successful",
		"data":    product,
	})
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