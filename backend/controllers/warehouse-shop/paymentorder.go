package controllers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

func CreatePaymentOrder(c *gin.Context) {
	var input struct {
		CartID      uint    `json:"cart_id"`
		PromotionID *uint   `json:"promotion_id"`
		MethodID    *uint    `json:"method_id"`
		BasePrice   float32 `json:"base_price"`
		Discount    float32 `json:"discount"`
		TotalPrice  float32 `json:"total_price"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()

	var cart entity.Cart
	if err := db.Preload("CartItems").First(&cart, input.CartID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	order := entity.PaymentOrder{
		CartID:     cart.ID,
		PromotionID:input.PromotionID,
		BasePrice:  input.BasePrice,
		Discount:   input.Discount,
		TotalPrice: input.TotalPrice,
		StatusID:   1,                //pending
		MethodID:   input.MethodID,
	}

	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"payment_order": order})
}

// GET /payment-orders/:id
func GetPaymentOrderByID(c *gin.Context) {
    id := c.Param("id")
    var paymentOrder entity.PaymentOrder
	db := connection.DB()

    if err := db.
        Preload("Cart.CartItems").
        Preload("Status").
        Preload("Promotion").
        Preload("Method").
        First(&paymentOrder, id).Error; err != nil {

        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "payment order not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"payment_order": paymentOrder})
}

func GetAllPaymentMethods(c *gin.Context) {
	var paymentMethods []entity.PaymentMethod
	if err := connection.DB().Find(&paymentMethods).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payment methods"})
		return
	}
	var formatPaymentMethods []gin.H
	for _, pm := range paymentMethods {
		formatPaymentMethods = append(formatPaymentMethods, gin.H{
			"id":               pm.ID,
			"payment_method":   pm.PaymentMethodName,
			"account_name":     pm.AccountName,
			"account_number":   pm.AccountNumber,
			"bank_name":        pm.BankName,
		})
	}
	c.JSON(http.StatusOK, formatPaymentMethods)
}

// PUT /payment-orders/:id
func UpdatePaymentOrder(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		MethodID    *uint   `json:"method_id"`
		StatusID    *uint   `json:"status_id"`
		PromotionID *uint   `json:"promotion_id"`
		ReceiptURL  *string `json:"receipt_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()
	tx := db.Begin() // เริ่ม transaction

	var order entity.PaymentOrder
	if err := tx.Preload("Cart.CartItems.Variant").First(&order, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "PaymentOrder not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// อัปเดต field ที่ส่งมา
	if input.MethodID != nil {
		order.MethodID = input.MethodID
	}
	if input.PromotionID != nil {
		order.PromotionID = input.PromotionID
	}
	if input.ReceiptURL != nil {
		order.ReceiptURL = *input.ReceiptURL
		now := time.Now()
		order.PaidAt = &now
		order.StatusID = 2 // ชำระเงินเรียบร้อย
	}

	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// อัปเดตยอดขายของ Product
	for _, item := range order.Cart.CartItems {
		if item.Selected {
			if err := UpdateProductSalesAndQuantity(tx, order.CartID, item.Variant.ProductID, item.VariantID, item.Quantity); err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}	


	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"payment_order": order})
}

// PUT /payment-orders/:id/expire
func ExpirePaymentOrder(c *gin.Context) {
    id := c.Param("id")
    db := connection.DB()

    var order entity.PaymentOrder
    if err := db.First(&order, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "PaymentOrder not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    //  expired
    order.StatusID = 4

    if err := db.Save(&order).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"payment_order": order})
}
