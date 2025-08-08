package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct{
	gorm.Model
	FirstName string `json:"staff_first_name"`
	LastName string	`json:"staff_last_name"`
	BirthDay  time.Time `json:"birthday"`
	Age uint8 `json:"staff_age"`
	Address string `json:"address"`
	Email string `json:"staff_email"`
	Password string `json:"-"`
	Phonenumber string  `json:"satff_phone_number"`

	GenderID uint `json:"gender_id"`
	Gender *Genders  `gorm:"foreignKey: gender_id" json:"gender"`
	DepartmentID uint `json:"department_id"`        
	Department *Department `gorm:"foreignKey: department_id" json:"department"`
	PositionID uint `json:"position_id"`        
	Position *Position `gorm:"foreignKey: position_id" json:"position"`
	RoleID uint `json:"role_id"`        
	Role *Role `gorm:"foreignKey: role_id" json:"role"`



}
