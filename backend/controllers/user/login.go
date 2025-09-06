package user

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/services"
)

type (
	Authen struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	signUp struct {
		FirstName string    `json:"first_name"`
		LastName  string    `json:"last_name"`
		Email     string    `json:"email"`
		Age       uint8     `json:"age"`
		Password  string    `json:"password"`
		BirthDay  time.Time `json:"birthday"`
		Phonenum  string    `json:"phonenum"`
		GenderID  uint      `json:"gender_id"`
		RoleID    uint      `json:"role_id"`
	}
)
type (
	ForgetPasswordRequest struct {
		Email string `json:"email" binding:"required,email"`
	}

	ResetPasswordRequest struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
)

// POST /signup
func SignUp(c *gin.Context) {
	var payload signUp
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()

	// check duplicate email
	var existing entity.User
	if err := db.Where("email = ?", payload.Email).First(&existing).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existing.ID != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
		return
	}

	// hash password
	hashed, err := connection.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// create user (DB column names come from struct fields, JSON tags don't affect DB)
	user := entity.User{
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Age:       payload.Age,
		Password:  hashed,
		BirthDay:  payload.BirthDay,
		Phonenum:  payload.Phonenum,
		GenderID:  payload.GenderID,
		RoleID:    payload.RoleID,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})
}

// POST /signin
func SignIn(c *gin.Context) {
	var payload Authen
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// find by email + preload role (avoid Raw SQL/table name issues)
	var user entity.User
	if err := connection.DB().
		Preload("Role").
		Preload("Department").
		Preload("Position").
		Where("email = ?", payload.Email).
		First(&user).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is incorrect"})
		return
	}

	var deptID *uint
	if user.DepartmentID != 0 {
		deptID = &user.DepartmentID
	}

	var posID *uint
	if user.PositionID != 0 {
		posID = &user.PositionID
	}

	var deptName *string
	if user.Department != nil && user.Department.Department != "" {
		deptName = &user.Department.Department
	}

	var posName *string
	if user.Position != nil && user.Position.Position != "" {
		posName = &user.Position.Position
	}
	// issue JWT
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	token, err := jwtWrapper.GenerateToken(
		user.Email,
		user.FirstName,
		user.LastName,
		user.ID,
		deptID,   
		deptName, 
		posID,    
		posName,  
		user.Phonenum,    
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error signing token"})
		return
	}

	// include role_id and role string in response
	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Role
	}
	deptNameStr := ""
	if user.Department != nil {
		deptNameStr = user.Department.Department
	}
	posNameStr := ""
	if user.Position != nil {
		posNameStr = user.Position.Position
	}

	// Create user object without sensitive data
	userResponse := gin.H{
		"id":        user.ID,
		"email":     user.Email,
		"firstname": user.FirstName, // assuming these fields exist
		"lastname":  user.LastName,  // assuming these fields exist
		"department_id": user.DepartmentID,
		"department": deptNameStr,
		"position_id": user.PositionID,
		"position": posNameStr,
		"phonenum":  user.Phonenum,
		"role":      roleName,
		"role_id":   user.RoleID,
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      token,
		"user":       userResponse, // ส่ง user object กลับมา
		"id":         user.ID,      // keep for backward compatibility
		"role_id":    user.RoleID,  // keep for backward compatibility
		"role":       roleName,     // keep for backward compatibility
	})
}

func ForgetPassword(c *gin.Context) {
	var payload ForgetPasswordRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()

	// ตรวจสอบว่า email มีอยู่ในระบบหรือไม่
	var user entity.User
	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// ไม่แจ้งให้ผู้ใช้ทราบว่า email ไม่มีในระบบ (security best practice)
			c.JSON(http.StatusOK, gin.H{"message": "If email exists, reset link has been sent"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// สร้าง reset token
	token, err := generateResetToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset token"})
		return
	}

	// ลบ token เก่าที่ยังไม่หมดอายุ (ถ้ามี)
	db.Where("email = ? AND expires_at > ? AND is_used = false", payload.Email, time.Now()).
		Delete(&entity.PasswordReset{})

	// สร้าง password reset record
	passwordReset := entity.PasswordReset{
		Email:     payload.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(15 * time.Minute), // token หมดอายุใน 15 นาที
		IsUsed:    false,
	}

	if err := db.Create(&passwordReset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reset token"})
		return
	}

	// ส่ง email ที่มี reset link ไปยัง user
	emailService := services.NewEmailService()
	if err := emailService.SendPasswordResetEmail(payload.Email, token); err != nil {
		// Log error but don't expose to user (security best practice)
		println("Failed to send email:", err.Error())
		c.JSON(http.StatusOK, gin.H{"message": "If email exists, reset link has been sent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reset password link has been sent to your email",
		// "token":   token, // remove this in production (for testing only)
	})
}

// POST /reset-password
func ResetPassword(c *gin.Context) {
	var payload ResetPasswordRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := connection.DB()

	// ตรวจสอบ token
	var passwordReset entity.PasswordReset
	if err := db.Where("token = ? AND expires_at > ? AND is_used = false",
		payload.Token, time.Now()).First(&passwordReset).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// hash password ใหม่
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// อัพเดท password ของ user
	if err := db.Model(&entity.User{}).
		Where("email = ?", passwordReset.Email).
		Update("password", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// mark token เป็น used
	if err := db.Model(&passwordReset).Update("is_used", true).Error; err != nil {
		// log error but don't fail the request
		println("Failed to mark token as used:", err.Error())
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

// Helper function สำหรับสร้าง secure random token
func generateResetToken() (string, error) {
	bytes := make([]byte, 32) // 32 bytes = 256 bits
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
