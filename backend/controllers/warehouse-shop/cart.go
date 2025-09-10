package products

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
type CartItemResponse struct {
    ID       uint   `json:"id"`
    Name     string `json:"name"`
    Color    string `json:"color"`
    Size     string `json:"size"`
    Price    float32    `json:"price"`
    Quantity int    `json:"quantity"`
    Picture  string `json:"picture"`
    Selected bool `json:"selected"`
}

type CartResponse struct {
    ID    uint               `json:"id"`
    UserID uint              `json:"user_id"`
    Items []CartItemResponse `json:"items"`
}

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

    // map data ไป response struct
    items := make([]CartItemResponse, 0, len(cart.CartItems))
    for _, item := range cart.CartItems {
        var color, size, name, picture string
        var price float32

        if item.Variant != nil {
            if item.Variant.Color != nil {
                color = item.Variant.Color.Color
            }
            if item.Variant.Size != nil {
                size = item.Variant.Size.Size
            }
            if item.Variant.Product != nil {
                name = item.Variant.Product.ProductName
                price = float32(item.Variant.Product.ProductPrice)
            }
            picture = item.Variant.Picture
        }
        items = append(items, CartItemResponse{
            ID:       item.ID,
            Name:     name,
            Color:    color,
            Size:     size,
            Price:    price,
            Quantity: int(item.Quantity),
            Picture:  picture,
            Selected: item.Selected,
        })
    }

    response := CartResponse{
        ID:     cart.ID,
        UserID: cart.UserID,
        Items:  items,
    }

    c.JSON(http.StatusOK, response)
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

// PATCH /cart/items/:id/select
func UpdateCartItemSelected(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Selected bool `json:"selected"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid body"})
		return
	}

	db := connection.DB()
	var item entity.CartItem

	if err := db.First(&item, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Cart item not found"})
		return
	}

	item.Selected = body.Selected

	if err := db.Save(&item).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update selected"})
		return
	}

	c.JSON(200, gin.H{
		"id":       item.ID,
		"selected": item.Selected,
	})
}