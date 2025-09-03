package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct{
	gorm.Model
	FirstName string `json:"first_name"`
	LastName string	`json:"last_name"`
	BirthDay  time.Time `json:"birthday"`
	Age uint8 `json:"age"`
	Address string `json:"address"`
	Email string `json:"email"`
	Password string `json:"-"`
	Phonenum string  `json:"phone_number"`

	GenderID uint `json:"gender_id"`
	Gender *Genders  `gorm:"foreignKey: gender_id" json:"gender"`
	DepartmentID uint `json:"department_id"`        
	Department *Department `gorm:"foreignKey: department_id" json:"department"`
	PositionID uint `json:"position_id"`        
	Position *Position `gorm:"foreignKey: position_id" json:"position"`
	RoleID uint `json:"role_id"`        
	Role *Role `gorm:"foreignKey: role_id" json:"role"`

}

type Genders struct {
   gorm.Model
   Gender string `json:"gender"`
}
