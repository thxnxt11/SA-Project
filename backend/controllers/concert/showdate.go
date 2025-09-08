package concert

import (
  "net/http"
	"strconv"
  
	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"time"
)

func AddShowdate(c *gin.Context) {
  db := connection.DB()
  
	var newdate entity.ShowDate
	if err := c.ShouldBindJSON(&newdate); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}
  
	if err := db.Create(&newdate).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert showdate: " + err.Error()})
		return
	}
  
	c.JSON(http.StatusCreated, newdate)
}

func DeleteShowdate(c *gin.Context) {
  db := connection.DB()
  
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
  
	if err := db.Where("concert_id = ?", id).Delete(&entity.ShowDate{}).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}
  
	c.JSON(http.StatusOK, gin.H{"message": "showdate deleted"})
}

func DeleteShowdatebyid(c *gin.Context) {
  db := connection.DB()
  
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
  
	if err := db.Where("id = ?", id).Delete(&entity.ShowDate{}).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}
  
	c.JSON(http.StatusOK, gin.H{"message": "showdate deleted"})
}


func UpdateShowdate(c *gin.Context) {
  db := connection.DB()
  
  cid, err := strconv.Atoi(c.Param("id"))
  if err != nil || cid <= 0 {
    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid concert id"})
    return
  }
  
  
  var req struct {
    VenueID  *uint      `json:"venue_id"`
    ShowDate *time.Time `json:"show_date" time_format:"2006-01-02T15:04:05Z07:00"`
  }
  if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json: " + err.Error()})
    return
  }
  
  updates := map[string]interface{}{}
  if req.VenueID  != nil { updates["venue_id"]  = *req.VenueID }
  if req.ShowDate != nil { updates["show_date"] = *req.ShowDate }
  if len(updates) == 0 {
    c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
    return
  }

  tx := db.Model(&entity.ShowDate{}).
    Where("concert_id = ?", cid).
    Updates(updates)
    if tx.Error != nil {
      c.JSON(http.StatusInternalServerError, gin.H{"error": tx.Error.Error()})
      return
    }
    if tx.RowsAffected == 0 {
      c.JSON(http.StatusNotFound, gin.H{"error": "showdate not found for this concert"})
      return
    }
    
    
    var out entity.ShowDate
    if err := db.Where("concert_id = ?", cid).
    Preload("Venue").
    First(&out).Error; err != nil {
      c.JSON(http.StatusOK, gin.H{"message": "showdate updated"})
      return
    }
    c.JSON(http.StatusOK, out)
  }
  // DELETE /showdate/:concert_id/date/:date (date format: YYYY-MM-DD)
func DeleteShowdateByConcertAndDate(c *gin.Context) {
  db := connection.DB()
  concertID, err := strconv.Atoi(c.Param("concert_id"))
  if err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid concert_id"})
      return
  }
  
  dateStr := c.Param("date")
  t, err := time.Parse("2006-01-02", dateStr)
  if err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, must be YYYY-MM-DD"})
      return
  }
  // แปลงเป็น start และ end ของวันนั้น
  startOfDay := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
  endOfDay := time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, time.UTC)
  // ตรวจสอบก่อนลบ
  var count int64
  db.Model(&entity.ShowDate{}).
      Where("concert_id = ? AND show_date >= ? AND show_date <= ?", concertID, startOfDay, endOfDay).
      Count(&count)
  
  if count == 0 {
      c.JSON(http.StatusNotFound, gin.H{"error": "No showdate found for this concert and date"})
      return
  }
  // ลบข้อมูล
  result := db.Where("concert_id = ? AND show_date >= ? AND show_date <= ?", concertID, startOfDay, endOfDay).
      Delete(&entity.ShowDate{})
      
  if result.Error != nil {
      c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed: " + result.Error.Error()})
      return
  }
  c.JSON(http.StatusOK, gin.H{
      "message": "showdate deleted for concert and date",
      "deleted_count": result.RowsAffected,
  })
}
