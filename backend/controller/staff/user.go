package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/entity"
	"github.com/yourname/went-back/service/staff"
)

type UserController struct {
	Service *service.UserService
}

// GET /users
func (ctl *UserController) GetUsers(c *gin.Context) {
	onlyStaffAdmin := c.DefaultQuery("only_staff_admin", "false") == "true"
	users, err := ctl.Service.GetAllUsers(onlyStaffAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GET /users/:id
func (ctl *UserController) GetUserByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var user entity.User
	if err := ctl.Service.GetUserByID(uint(id), &user); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// POST /users
func (ctl *UserController) CreateUser(c *gin.Context) {
	var input struct {
		FirstName    string `json:"first_name" binding:"required"`
		LastName     string `json:"last_name" binding:"required"`
		Email        string `json:"email" binding:"required,email"`
		Password     string `json:"password"`
		Birthday     string `json:"birthday" binding:"required"`
		Phonenumber  string `json:"phone_number"`
		Address      string `json:"address"`
		GenderID     uint   `json:"gender_id" binding:"required"`
		RoleID       uint   `json:"role_id" binding:"required"`
		DepartmentID uint   `json:"department_id" binding:"required"`
		PositionID   uint   `json:"position_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	birthTime, _ := time.Parse("2006-01-02", input.Birthday)
	pass := input.Password
	if pass == "" {
		pass = input.FirstName + birthTime.Format("20060102")
	}
	hashed, _ := connection.HashPassword(pass)

	user, err := ctl.Service.CreateUser(service.CreateUserInput{
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		BirthDay:     birthTime,
		Address:      input.Address,
		Email:        input.Email,
		Password:     hashed,
		Phonenumber:  input.Phonenumber,
		GenderID:     input.GenderID,
		RoleID:       input.RoleID,
		DepartmentID: input.DepartmentID,
		PositionID:   input.PositionID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": user, "default_pass": pass})
}

// PUT /users/:id
func (ctl *UserController) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// ดึง user จาก DB
	var user entity.User
	if err := ctl.Service.GetUserByID(uint(id), &user); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// bind JSON input
	var req struct {
		FirstName    string `json:"first_name" binding:"required"`
		LastName     string `json:"last_name" binding:"required"`
		Email        string `json:"email" binding:"required,email"`
		Birthday     string `json:"birthday"`
		Phonenumber  string `json:"phone_number"`
		Address      string `json:"address"`
		GenderID     uint   `json:"gender_id"`
		RoleID       uint   `json:"role_id"`
		DepartmentID uint   `json:"department_id"`
		PositionID   uint   `json:"position_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// แปลงวันเกิดถ้ามี
	if req.Birthday != "" {
		birthTime, err := time.Parse("2006-01-02", req.Birthday)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid birthday format"})
			return
		}
		user.BirthDay = birthTime
	}

	// อัพเดต fields
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Email = req.Email
	user.Phonenumber = req.Phonenumber
	user.Address = req.Address
	user.GenderID = req.GenderID
	user.RoleID = req.RoleID
	user.DepartmentID = req.DepartmentID
	user.PositionID = req.PositionID

	// เรียก Service UpdateUser
	if err := ctl.Service.UpdateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": user})
}

// DELETE /users/:id
func (ctl *UserController) DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := ctl.Service.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// GET /genders
func (ctl *UserController) GetGenders(c *gin.Context) {
	var genders []entity.Genders
	if err := ctl.Service.DB.Find(&genders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, genders)
}

// GET /roles
func (ctl *UserController) GetRoles(c *gin.Context) {
	var roles []entity.Role
	if err := ctl.Service.DB.Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, roles)
}

// GET /departments
func (ctl *UserController) GetDepartments(c *gin.Context) {
	var departments []entity.Department
	if err := ctl.Service.DB.Find(&departments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, departments)
}

// GET /positions
func (ctl *UserController) GetPositions(c *gin.Context) {
	var positions []entity.Position
	if err := ctl.Service.DB.Find(&positions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, positions)
}



