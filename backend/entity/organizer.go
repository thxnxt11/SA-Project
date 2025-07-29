package entity

import (
	"gorm.io/gorm"
)

type Organizer struct {
	gorm.Model
	OrganizerName string `json:"organizer_name"`
	Email string `json:"organizer_email"`
	Password string `json:"-"`
	PhoneNumber string `json:"organizer_phone_number"`
	Description string `json:"organizer_description"`
}