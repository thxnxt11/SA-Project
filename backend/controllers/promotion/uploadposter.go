package promotion

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

	func UploadFile(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "ไม่พบไฟล์ที่อัปโหลด"})
			return
		}

		// สร้างชื่อไฟล์ใหม่ไม่ให้ซ้ำ
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
		uploadPath := "./uploads"

		// ตรวจสอบว่ามีโฟลเดอร์ uploads หรือยัง
		if _, err := os.Stat(uploadPath); os.IsNotExist(err) {
			os.MkdirAll(uploadPath, os.ModePerm)
		}

		// path เต็มของไฟล์
		fullPath := filepath.Join(uploadPath, filename)

		// บันทึกไฟล์
		if err := c.SaveUploadedFile(file, fullPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "อัปโหลดไฟล์ไม่สำเร็จ"})
			return
		}

		// ส่ง URL กลับไปให้ frontend
		fileURL := "/uploads/" + filename

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"url": fileURL,
			},
		})
	}
