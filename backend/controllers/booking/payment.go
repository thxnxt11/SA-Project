package booking

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
)

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