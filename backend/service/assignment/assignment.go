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
	Task                string `json:"task"`
	Description         string `json:"description"`
	ShowDateID          uint   `json:"show_date_id"`
	AssignmentDateStart string `json:"assignment_date_start"` // YYYY-MM-DD
	AssignmentDateEnd   string `json:"assignment_date_end"`   // YYYY-MM-DD
	AssignmentTimeStart string `json:"assignment_time_start"` // HH:mm
	AssignmentTimeEnd   string `json:"assignment_time_end"`   // HH:mm
	StaffIDs            []uint `json:"staff_ids"`
}

// -------------------- Helper --------------------
// รวมวันกับเวลาเป็น time.Time
func parseDateTime(dateStr, timeStr string) (time.Time, error) {
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, err
	}
	t, err := time.Parse("15:04", timeStr)
	if err != nil {
		return time.Time{}, err
	}
	return time.Date(date.Year(), date.Month(), date.Day(),
		t.Hour(), t.Minute(), 0, 0, time.Local), nil
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

	startDT, err := parseDateTime(input.AssignmentDateStart, input.AssignmentTimeStart)
	if err != nil {
		return nil, errors.New("invalid start date/time")
	}
	endDT, err := parseDateTime(input.AssignmentDateEnd, input.AssignmentTimeEnd)
	if err != nil {
		return nil, errors.New("invalid end date/time")
	}
	if startDT.After(endDT) {
		return nil, errors.New("start datetime must be before end datetime")
	}

	tx := s.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	assignment := entity.Assignment{
		Task:                input.Task,
		Description:         input.Description,
		ShowDateID:          input.ShowDateID,
		AssignmentStatusID:  1, // Pending
		AssignmentDateStart: startDT,
		AssignmentDateEnd:   endDT,
		AssignmentTimeStart: startDT,
		AssignmentTimeEnd:   endDT,
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

	// อัปเดต status หลังสร้าง
	s.UpdateAssignmentStatus(assignment.ID)

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

	startDT, err := parseDateTime(input.AssignmentDateStart, input.AssignmentTimeStart)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("invalid start date/time")
	}
	endDT, err := parseDateTime(input.AssignmentDateEnd, input.AssignmentTimeEnd)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("invalid end date/time")
	}

	assignment.Task = input.Task
	assignment.Description = input.Description
	assignment.ShowDateID = input.ShowDateID
	assignment.AssignmentDateStart = startDT
	assignment.AssignmentDateEnd = endDT
	assignment.AssignmentTimeStart = startDT
	assignment.AssignmentTimeEnd = endDT

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

// Delete StaffAssignment ของ Assignment
// DeleteAssignment ลบทั้ง Assignment และ StaffAssignments
func (s *AssignmentService) DeleteAssignment(assignmentID uint) error {
	tx := s.DB.Begin()
	defer tx.Rollback() // rollback ถ้า commit ไม่สำเร็จ

	// ตรวจสอบว่า Assignment มีอยู่
	var assignment entity.Assignment
	if err := tx.First(&assignment, assignmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("assignment not found")
		}
		return err
	}

	// ลบ StaffAssignments ก่อน
	if err := tx.Where("assignment_id = ?", assignmentID).
		Delete(&entity.StaffAssignment{}).Error; err != nil {
		return fmt.Errorf("failed to delete staff assignments: %w", err)
	}

	// ลบ Assignment
	if err := tx.Delete(&assignment).Error; err != nil {
		return fmt.Errorf("failed to delete assignment: %w", err)
	}

	// commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("commit failed: %w", err)
	}

	return nil
}


// UpdateAssignmentStatus อัปเดตสถานะ Assignment ตาม StaffAssignments
func (s *AssignmentService) UpdateAssignmentStatus(id uint) error {
	var assignment entity.Assignment

	// ดึง Assignment พร้อม preload StaffAssignments
	if err := s.DB.Preload("StaffAssignments.AssignmentStatus").First(&assignment, id).Error; err != nil {
		return err
	}

	// กำหนดค่าเริ่มต้น
	newStatus := uint(1) // Pending

	if len(assignment.StaffAssignments) > 0 {
		allCompleted := true
		for _, sa := range assignment.StaffAssignments {
			if sa.AssignmentStatusID != 3 { // 3 = Completed
				allCompleted = false
				break
			}
		}

		if allCompleted {
			newStatus = 3 // Completed
		} else {
			newStatus = 2 // In Progress
		}
	}

	assignment.AssignmentStatusID = newStatus

	// บันทึกกลับ DB
	return s.DB.Save(&assignment).Error
}

