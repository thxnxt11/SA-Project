package products

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// ฟังก์ชันสำหรับอัปโหลดรูปสินค้า
func UploadProductImage(c *gin.Context) {
	uploadFileToFolder(c, "products")
}

// ฟังก์ชันสำหรับอัปโหลดสลิป
func UploadReceiptImage(c *gin.Context) {
	uploadFileToFolder(c, "order-receipts")
}

func uploadFileToFolder(c *gin.Context, folder string) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "ไม่พบไฟล์ที่อัปโหลด"})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	uploadPath := filepath.Join("./uploads", folder)

	if _, err := os.Stat(uploadPath); os.IsNotExist(err) {
		os.MkdirAll(uploadPath, os.ModePerm)
	}

	fullPath := filepath.Join(uploadPath, filename)

	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "อัปโหลดไฟล์ไม่สำเร็จ"})
		return
	}

	fileURL := fmt.Sprintf("/uploads/%s/%s", folder, filename)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"url": fileURL,
		},
	})
}
