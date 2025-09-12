package services

import (
	"time"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type UserService struct {
	DB *gorm.DB
}

func (s *UserService) GetGenders() (any, any) {
	panic("unimplemented")
}

// Input สำหรับสร้าง User
type CreateUserInput struct {
	FirstName    string
	LastName     string
	BirthDay     time.Time
	Age          uint8
	Address      string
	Email        string
	Password     string
	Phonenumber  string
	GenderID     uint
	DepartmentID uint
	PositionID   uint
	RoleID       uint
}

// สร้าง User ใหม่
func (s *UserService) CreateUser(input CreateUserInput) (*entity.User, error) {
	user := entity.User{
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		BirthDay:     input.BirthDay,
		Age:          input.Age,
		Address:      input.Address,
		Email:        input.Email,
		Password:     input.Password,
		Phonenum:  input.Phonenumber,
		GenderID:     input.GenderID,
		DepartmentID: input.DepartmentID,
		PositionID:   input.PositionID,
		RoleID:       input.RoleID,
	}

	if err := s.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	// preload relations
	if err := s.DB.Preload("Gender").
		Preload("Department").
		Preload("Position").
		Preload("Role").
		First(&user, user.ID).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// ดึง User ตาม ID พร้อม relations
func (s *UserService) GetUserByID(id uint, user *entity.User) error {
	return s.DB.Preload("Gender").
		Preload("Department").
		Preload("Position").
		Preload("Role").
		First(user, id).Error
}

// ดึง Users ทั้งหมด (option: กรองเฉพาะ Staff/Admin)
func (s *UserService) GetAllUsers(onlyStaffAdmin bool) ([]entity.User, error) {
	var users []entity.User
	query := s.DB.Preload("Gender").
		Preload("Department").
		Preload("Position").
		Preload("Role")
	if onlyStaffAdmin {
		query = query.Where("role_id IN ?", []uint{3, 4}) // Admin & Staff
	}
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// Update User
func (s *UserService) UpdateUser(user *entity.User) error {
	return s.DB.Model(&entity.User{}).Where("id = ?", user.ID).Updates(user).Error
}

// Delete User
func (s *UserService) DeleteUser(id uint) error {
	var user entity.User
	if err := s.DB.First(&user, id).Error; err != nil {
		return err
	}
	return s.DB.Delete(&user).Error
}

