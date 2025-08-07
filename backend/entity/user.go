package entity

import (
   "time"
   "gorm.io/gorm"
)

type User struct {
   gorm.Model
   FirstName string    `json:"first_name"`
   LastName  string    `json:"last_name"`
   Email     string    `json:"email"`
   Password  string    `json:"-"`
   BirthDay  time.Time `json:"birthday"`
   Age       uint8     `json:"age"`
   Phonenum	 string	   `json:"phonenum"`
   GenderID  uint      `json:"gender_id"`
   Gender    *Genders  `gorm:"foreignKey: gender_id" json:"gender"`
   RoleID    uint      `json:"role_id"`
   Role      *Role     `gorm:"foreignKey: RoleID" json:"role"`
}

type Genders struct {
   gorm.Model
   Gender string `json:"gender"`
}