package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

// POST /cart/add
func AddToCart(c *gin.Context) {
    var body struct {
        UserID    uint `json:"user_id"`
        VariantID uint `json:"variant_id"`
        Quantity  uint `json:"quantity"`
    }

    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := connection.DB()

    var cart entity.Cart
    if err := db.Where("user_id = ?", body.UserID).First(&cart).Error; err != nil {
        cart = entity.Cart{UserID: body.UserID}
        if err := db.Create(&cart).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create cart"})
            return
        }
    }

    var cartItem entity.CartItem
    err := db.Where("cart_id = ? AND variant_id = ?", cart.ID, body.VariantID).First(&cartItem).Error
    if err == nil {
        cartItem.Quantity += body.Quantity
        db.Save(&cartItem)
    } else {
        cartItem = entity.CartItem{
            CartID:    cart.ID,
            VariantID: body.VariantID,
            Quantity:  body.Quantity,
        }
        db.Create(&cartItem)
    }

    c.JSON(http.StatusOK, gin.H{"message": "Added to cart", "cart_item": cartItem})
}

// GET /cart/:user_id
func GetCartByUserID(c *gin.Context) {
    userIDStr := c.Param("user_id")
    userID, err := strconv.Atoi(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    db := connection.DB()
    var cart entity.Cart
    if err := db.Preload("CartItems.Variant.Color").
                  Preload("CartItems.Variant.Size").
                  Preload("CartItems.Variant.Product").
                  Where("user_id = ?", userID).
                  First(&cart).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
        return
    }

    c.JSON(http.StatusOK, cart)
}

// PUT /cart/item/:id
func UpdateCartItem(c *gin.Context) {
    itemIDStr := c.Param("id")
    itemID, err := strconv.Atoi(itemIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
        return
    }

    var body struct {
        Quantity uint `json:"quantity"`
    }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := connection.DB()
    var cartItem entity.CartItem
    if err := db.First(&cartItem, itemID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
        return
    }

    cartItem.Quantity = body.Quantity
    db.Save(&cartItem)

    c.JSON(http.StatusOK, gin.H{"message": "Cart item updated", "cart_item": cartItem})
}

// DELETE /cart/item/:id
func RemoveCartItem(c *gin.Context) {
    itemIDStr := c.Param("id")
    itemID, err := strconv.Atoi(itemIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
        return
    }

    db := connection.DB()
    if err := db.Delete(&entity.CartItem{}, itemID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot delete cart item"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Cart item removed"})
}
