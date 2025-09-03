package user

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type UserController struct{
	DB *gorm.DB
}

type userDataInput struct{
	FirstName   *string `json:"first_name"`   
	LastName    *string `json:"last_name"`    
	PhoneNumber *string `json:"phone_number"` 
	Birthday    *string `json:"birthday"`     
	Age         *int    `json:"age"`
	Address     *string `json:"address"`
	GenderID    *uint   `json:"gender_id"`
}

func GetUserDataById (c *gin.Context){
	userId := c.Param("user_id")
	uid, err := strconv.ParseUint(userId, 10, 32)
	
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user entity.User
	if err := connection.DB().
		Preload("Gender").
		First(&user, uint(uid)).Error; err != nil{
		if err == gorm.ErrRecordNotFound{
			c.JSON(http.StatusNotFound,gin.H{"error: ": "user not found"})
			return
		}	
		c.JSON(http.StatusInternalServerError,gin.H{"error": "database error"})
		return
	}

	c.JSON(http.StatusOK,user)
}

func GetAllGender (c *gin.Context){
	var genders []entity.Genders
	if err := connection.DB().Find(&genders).Error; err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error": "Failed to fetch gender"})
		return
	}

	var formatted []gin.H
	for _, g := range genders {
		formatted = append(formatted, gin.H{
			"id":     g.ID,
			"gender": g.Gender,
		})
	}
	c.JSON(http.StatusOK, formatted)
}

func UpdateUserDataById (c *gin.Context){
	userId := c.Param("user_id")
	uid, err := strconv.ParseUint(userId,10, 32)
	if err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid userId"})
		return
	}

	var user entity.User
	if err := connection.DB().First(&user,uint(uid)).Error; err != nil{
		if err == gorm.ErrRecordNotFound{
			c.JSON(http.StatusNotFound,gin.H{"error":"userId not found"})
			return
		}
		c.JSON(http.StatusInternalServerError,gin.H{"error":"database error"})
		return
	}
	var in userDataInput
	if err := c.ShouldBindJSON(&in); err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error": err.Error()})
		return
	}

	if in.FirstName != nil{
		user.FirstName = *in.FirstName
	}

	if in.LastName != nil{
		user.LastName = *in.LastName
	}

	if in.PhoneNumber != nil{
		user.Phonenum = *in.PhoneNumber
	}

	if in.Address != nil {
		user.Address = *in.Address
	}
	if in.Age != nil {
		user.Age = uint8(*in.Age)
	}
	if in.GenderID != nil {
		user.GenderID = *in.GenderID
	}
	if in.Birthday != nil {
		t, parseErr := time.Parse(time.RFC3339, *in.Birthday)
		if parseErr != nil {
			if t2, parseErr2 := time.Parse("2006-01-02", *in.Birthday); parseErr2 == nil {
				user.BirthDay = t2
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid birthday format"})
				return
			}
		} else {
			user.BirthDay = t
		}
	}

	if err := connection.DB().Save(&user).Error; err != nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"update failed"})
		return
	}
	if err := connection.DB().
		Preload("Gender").
		First(&user, userId).Error; err != nil{

	}
	c.JSON(http.StatusOK, user)
}