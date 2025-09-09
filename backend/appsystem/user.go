package appsystem

// import (
// 	"net/http"
	
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"github.com/yourname/went-back/connection"
// 	"github.com/yourname/went-back/entity"
// 	"gorm.io/gorm"
// )

// // GET /api/users?role_min=3&role_max=4
// func GetUsers(c *gin.Context) {
//     roleMin := c.DefaultQuery("role_min", "0")
//     roleMax := c.DefaultQuery("role_max", "999")

//     var users []entity.User
//     if err := connection.DB().
//         Preload("Department").
//         Preload("Position").
//         Preload("Role").
//         Preload("Gender").
//         Where("role_id BETWEEN ? AND ?", roleMin, roleMax).
//         Find(&users).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }

//     c.JSON(http.StatusOK, users)
// }


// // GET /api/genders
// func GetGenders(c *gin.Context) {
// 	var genders []entity.Genders
// 	connection.DB().Find(&genders)
// 	c.JSON(http.StatusOK, genders)
// }

// // GET /api/roles
// func GetRoles(c *gin.Context) {
// 	var roles []entity.Role
// 	connection.DB().Find(&roles)
// 	c.JSON(http.StatusOK, roles)
// }

// // GET /api/departments
// func GetDepartments(c *gin.Context) {
// 	var departments []entity.Department
// 	connection.DB().Find(&departments)
// 	c.JSON(http.StatusOK, departments)
// }

// // GET /api/positions
// func GetPositions(c *gin.Context) {
// 	var positions []entity.Position
// 	connection.DB().Find(&positions)
// 	c.JSON(http.StatusOK, positions)
// }

// // POST /users and /api/users
// func CreateUser(c *gin.Context) {
// 	type createUserInput struct {
// 		FirstName    string `json:"firstName" binding:"required"`
// 		LastName     string `json:"lastName" binding:"required"`
// 		Email        string `json:"email" binding:"required,email"`
// 		Password     string `json:"password"`
// 		BirthDay     string `json:"birthday" binding:"required"`
// 		Phonenumber  string `json:"phonenumber"`
// 		GenderID     uint   `json:"gender_id" binding:"required"`
// 		RoleID       uint   `json:"role_id" binding:"required"`
// 		DepartmentID uint   `json:"department_id" binding:"required"`
// 		PositionID   uint   `json:"position_id" binding:"required"`
// 		Address      string `json:"address"`
// 	}

// 	var input createUserInput
// 	if err := c.ShouldBindJSON(&input); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// ตรวจสอบอีเมลซ้ำ
// 	var exists entity.User
// 	if err := connection.DB().Where("email = ?", input.Email).First(&exists).Error; err != nil {
// 		if err != gorm.ErrRecordNotFound {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
// 	} else {
// 		if exists.ID != 0 {
// 			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
// 			return
// 		}
// 	}

// 	// แปลงวันเกิด (YYYY-MM-DD)
// 	birthTime, err := time.Parse("2006-01-02", input.BirthDay)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid birthday format, expected YYYY-MM-DD"})
// 		return
// 	}

// 	// ถ้าไม่ส่งรหัสผ่าน กำหนดค่า default = firstName + YYYYMMDD
// 	password := input.Password
// 	if password == "" {
// 		password = input.FirstName + birthTime.Format("20060102")
// 	}

// 	// แฮ็ชรหัสผ่าน
// 	hashed, err := connection.HashPassword(password)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
// 		return
// 	}

// 	user := entity.User{
// 		FirstName:    input.FirstName,
// 		LastName:     input.LastName,
// 		Email:        input.Email,
// 		Password:     hashed,
// 		BirthDay:     birthTime,
// 		Phonenumber:  input.Phonenumber,
// 		GenderID:     input.GenderID,
// 		RoleID:       input.RoleID,
// 		DepartmentID: input.DepartmentID,
// 		PositionID:   input.PositionID,
// 		Address:      input.Address,
// 	}

// 	if err := connection.DB().Create(&user).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, gin.H{
// 		"message": "User created successfully",
// 		"user":    user,
// 	})
// }

