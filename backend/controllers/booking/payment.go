package booking

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
)

type createPaymentDTO struct {
	BookingID       uint     `json:"booking_id" binding:"required"`
	PromotionID     *uint    `json:"promotion_id"`
	RefundTypeID    *uint    `json:"refund_type_id"`
	PaymentMethodID uint     `json:"payment_method_id" binding:"required"`
	BasePrice       float32  `json:"base_price"`
	Discount        float32  `json:"discount"`
	RefundFee       float32  `json:"refund_fee"`
	TotalPrice      *float32 `json:"total_price"`
}	

func GetRefundTypes(c *gin.Context) {
	var refundTypes []entity.RefundType
	if err := connection.DB().Find(&refundTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch refund types"})
		return
	}
	var formatRefundTypes []gin.H
	for _, rft := range refundTypes {
		formatRefundTypes = append(formatRefundTypes, gin.H{
			"id":          rft.ID,
			"refund_type": rft.RefundTypeName,
			"refund_fee":  rft.RefundFee,
		})
	}
	c.JSON(http.StatusOK, formatRefundTypes)
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

func CreatePayment(c *gin.Context) {

	var in createPaymentDTO
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "invalid payload",
			"detail": err.Error(),
		})
		return
	}

	paymentService := services.NewPaymentService()
	payment, err := paymentService.CreatePayment(services.CreatePaymentInput{
		BookingID:       in.BookingID,
		PromotionID:     in.PromotionID,
		RefundTypeID:    in.RefundTypeID,
		PaymentMethodID: in.PaymentMethodID,
		BasePrice:      in.BasePrice,
		Discount:       in.Discount,
		RefundFee:      int(in.RefundFee),
		TotalPrice:     in.TotalPrice,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"payment_id": payment})
}	

func UpdatePaymentReceipt(c *gin.Context) {

    id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "missing id in path"})
        return
    }

    var req struct {
        ReceiptURL string `json:"receipt_url" binding:"required"` 
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body: " + err.Error()})
        return
    }

    db := connection.DB()

    // ตรวจว่ามี payment นี้จริง
    var payment entity.Payment
    if err := db.First(&payment, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
        return
    }

    if err := db.Model(&entity.Payment{}).
		Where("id = ?", id).
		Update("receipt_url", req.ReceiptURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update receipt URL"})
		return
	}

	svc := services.NewPaymentService()
	updated, err := svc.UpdatePaymentStatusToPaid(payment.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark payment as paid"})
		return
	}

    c.JSON(http.StatusOK, gin.H{"message": "receipt updated successfully","data":    updated,})
}
