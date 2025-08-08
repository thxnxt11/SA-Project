package entity

import (
   "time"
   "gorm.io/gorm"
)

type Users struct {
   gorm.Model
   FirstName string    `json:"first_name"`
   LastName  string    `json:"last_name"`
   Email     string    `json:"email"`
   Age       uint8     `json:"age"`
   Password  string    `json:"-"`
   BirthDay  time.Time `json:"birthday"`
   Phonenum	 string	   `json:"phonenum"`
   GenderID  uint      `json:"gender_id"`
   Gender    *Genders  `gorm:"foreignKey: gender_id" json:"gender"`
}

type Genders struct {
   gorm.Model
   Gender string `json:"gender"`
}