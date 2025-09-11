package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

type AssignmentService struct {
	DB *gorm.DB
}

// -------------------- Input --------------------
type AssignmentInput struct {
	Task        string `json:"task"`
	Description string `json:"description"`
	ShowDateID  uint   `json:"show_date_id"`

	// รับ datetime ตรงๆ เช่น "2025-09-10 14:30:00"
	AssignmentStart string `json:"assignment_start"`
	AssignmentEnd   string `json:"assignment_end"`

	StaffIDs []uint `json:"staff_ids"`
}

// -------------------- Helper --------------------
// parse datetime string เช่น "2025-09-10 14:30:00"
func parseDateTime(datetimeStr string) (time.Time, error) {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	return time.ParseInLocation("2006-01-02 15:04:05", datetimeStr, loc)
}

// Assign staff ให้ assignment
func (s *AssignmentService) assignStaff(tx *gorm.DB, assignmentID uint, staffIDs []uint) error {
	uniqueStaff := make(map[uint]bool)
	for _, staffID := range staffIDs {
		if uniqueStaff[staffID] {
			continue
		}
		uniqueStaff[staffID] = true

		var user entity.User
		if err := tx.First(&user, staffID).Error; err != nil {
			return errors.New("staff not found")
		}
		if user.RoleID != 4 {
			return errors.New("only staff (role_id=4) can be assigned")
		}

		staffAssign := entity.StaffAssignment{
			UserID:             staffID,
			AssignmentID:       assignmentID,
			AssignmentStatusID: 1, // Not Started
			AssignedAt:         time.Now(),
		}
		if err := tx.Create(&staffAssign).Error; err != nil {
			return err
		}
	}
	return nil
}

// -------------------- CRUD --------------------

// Get All Assignments
func (s *AssignmentService) GetAllAssignments() ([]entity.Assignment, error) {
	var assignments []entity.Assignment
	err := s.DB.Preload("AssignmentStatus").
		Preload("ShowDate").
		Preload("ShowDate.Concert").
		Preload("ShowDate.Venue").
		Preload("StaffAssignments.User.Role").
		Preload("StaffAssignments.AssignmentStatus").
		Find(&assignments).Error
	return assignments, err
}

// Get Assignment by ID
func (s *AssignmentService) GetAssignmentByID(id uint) (*entity.Assignment, error) {
	var assignment entity.Assignment
	err := s.DB.Preload("AssignmentStatus").
		Preload("ShowDate").
		Preload("ShowDate.Concert").
		Preload("ShowDate.Venue").
		Preload("StaffAssignments.User.Role").
		Preload("StaffAssignments.AssignmentStatus").
		First(&assignment, id).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// Create Assignment
func (s *AssignmentService) CreateAssignment(input AssignmentInput) (*entity.Assignment, error) {
	if input.Task == "" || input.Description == "" {
		return nil, errors.New("task and description are required")
	}

	startDT, err := parseDateTime(input.AssignmentStart)
	if err != nil {
		return nil, errors.New("invalid start datetime")
	}
	endDT, err := parseDateTime(input.AssignmentEnd)
	if err != nil {
		return nil, errors.New("invalid end datetime")
	}
	if !startDT.Before(endDT) {
		return nil, errors.New("start datetime must be before end datetime")
	}

	// ตรวจสอบเวลาปัจจุบัน
	now := time.Now()
	if startDT.Before(now) || endDT.Before(now) {
		return nil, errors.New("assignment start and end time must be in the future")
	}

	if !startDT.Before(endDT) {
		return nil, errors.New("start datetime must be before end datetime")
	}

	tx := s.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	assignment := entity.Assignment{
		Task:               input.Task,
		Description:        input.Description,
		ShowDateID:         input.ShowDateID,
		AssignmentStatusID: 1, // Pending
		AssignmentStart:    startDT,
		AssignmentEnd:      endDT,
	}

	if err := tx.Create(&assignment).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := s.assignStaff(tx, assignment.ID, input.StaffIDs); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	return &assignment, nil
}

// Update Assignment
func (s *AssignmentService) UpdateAssignment(id uint, input AssignmentInput) (*entity.Assignment, error) {
	tx := s.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var assignment entity.Assignment
	if err := tx.First(&assignment, id).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("assignment not found")
	}

	startDT, err := parseDateTime(input.AssignmentStart)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("invalid start datetime")
	}
	endDT, err := parseDateTime(input.AssignmentEnd)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("invalid end datetime")
	}
	if !startDT.Before(endDT) {
		tx.Rollback()
		return nil, errors.New("start datetime must be before end datetime")
	}

	// ตรวจสอบเวลาปัจจุบัน
	now := time.Now()
	if startDT.Before(now) || endDT.Before(now) {
		tx.Rollback()
		return nil, errors.New("assignment start and end time must be in the future")
	}

	if !startDT.Before(endDT) {
		tx.Rollback()
		return nil, errors.New("start datetime must be before end datetime")
	}

	assignment.Task = input.Task
	assignment.Description = input.Description
	assignment.ShowDateID = input.ShowDateID
	assignment.AssignmentStart = startDT
	assignment.AssignmentEnd = endDT

	if err := tx.Save(&assignment).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// ลบ staff assignments เก่า
	if err := tx.Where("assignment_id = ?", id).Delete(&entity.StaffAssignment{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := s.assignStaff(tx, id, input.StaffIDs); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// อัปเดต status หลังแก้ไข
	s.UpdateAssignmentStatus(id)

	return &assignment, nil
}

// DeleteAssignment ลบทั้ง Assignment และ StaffAssignments
func (s *AssignmentService) DeleteAssignment(assignmentID uint) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var assignment entity.Assignment
	if err := tx.First(&assignment, assignmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("assignment not found")
		}
		return err
	}

	if err := tx.Where("assignment_id = ?", assignmentID).
		Delete(&entity.StaffAssignment{}).Error; err != nil {
		return fmt.Errorf("failed to delete staff assignments: %w", err)
	}

	if err := tx.Delete(&assignment).Error; err != nil {
		return fmt.Errorf("failed to delete assignment: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("commit failed: %w", err)
	}

	return nil
}

// UpdateAssignmentStatus อัปเดตสถานะ Assignment ตาม StaffAssignments
func (s *AssignmentService) UpdateAssignmentStatus(id uint) error {
	var assignment entity.Assignment

	// โหลด assignment พร้อม staff assignments
	if err := s.DB.Preload("StaffAssignments").First(&assignment, id).Error; err != nil {
		return err
	}

	// ถ้ายังไม่มี staff assignments ให้สถานะ Pending
	if len(assignment.StaffAssignments) == 0 {
		assignment.AssignmentStatusID = 1 // Pending
		return s.DB.Save(&assignment).Error
	}

	// มี staff assignments แล้วเช็คว่า completed ครบไหม
	allCompleted := true
	inProgressExists := false

	for _, sa := range assignment.StaffAssignments {
		switch sa.AssignmentStatusID {
		case 1: // Not Started
			allCompleted = false
		case 2: // In Progress
			allCompleted = false
			inProgressExists = true
		case 3: // Completed
			// do nothing
		default:
			allCompleted = false
		}
	}

	switch {
	case allCompleted:
		assignment.AssignmentStatusID = 3 // Completed
	case inProgressExists:
		assignment.AssignmentStatusID = 2 // In Progress
	default:
		assignment.AssignmentStatusID = 1 // Pending
	}

	return s.DB.Save(&assignment).Error
}
