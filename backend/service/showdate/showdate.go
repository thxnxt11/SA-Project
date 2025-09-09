package service

import (
	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type ShowDateService struct {
	DB *gorm.DB
}

// Get all ShowDates with Assignments + Staff
func (s *ShowDateService) GetAllShowDates() ([]entity.ShowDate, error) {
	var showdates []entity.ShowDate
	err := s.DB.
		Preload("Concert").
		Preload("Venue").
		Preload("Assignments.AssignmentStatus").
		Preload("Assignments.StaffAssignments.User.Role").
		Preload("Assignments.StaffAssignments.User.Department").
		Preload("Assignments.StaffAssignments.User.Position").
		Preload("Assignments.StaffAssignments.AssignmentStatus").
		Find(&showdates).Error
	if err != nil {
		return nil, err
	}
	return showdates, nil
}

// Get single ShowDate by ID with Assignments + Staff
func (s *ShowDateService) GetShowDateByID(id uint) (*entity.ShowDate, error) {
	var showdate entity.ShowDate
	err := s.DB.
		Preload("Concert").
		Preload("Venue").
		Preload("Assignments.AssignmentStatus").
		Preload("Assignments.StaffAssignments.User.Role").
		Preload("Assignments.StaffAssignments.User.Department").
		Preload("Assignments.StaffAssignments.User.Position").
		Preload("Assignments.StaffAssignments.AssignmentStatus").
		First(&showdate, id).Error
	if err != nil {
		return nil, err
	}
	return &showdate, nil
}
