package service

import (
	"errors"
	"time"

	"github.com/yourname/went-back/entity"
	"gorm.io/gorm"
)

var ErrPermissionDenied = errors.New("permission denied")

type StaffAssignmentService struct {
	DB *gorm.DB
}

// ดึง assignments ของ staff คนเดียว
func (s *StaffAssignmentService) GetMyAssignments(userID uint) ([]entity.Assignment, error) {
	var assignments []entity.Assignment
	if err := s.DB.Preload("StaffAssignments", "user_id = ?", userID).
		Preload("ShowDate").
		Preload("AssignmentStatus").
		Find(&assignments).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}

// รับงาน (Accept)
func (s *StaffAssignmentService) AcceptAssignment(assignmentID uint, userID uint) error {
	var sa entity.StaffAssignment
	err := s.DB.Where("assignment_id = ? AND user_id = ?", assignmentID, userID).First(&sa).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// สร้าง StaffAssignment ใหม่
		sa = entity.StaffAssignment{
			AssignmentID:       assignmentID,
			UserID:             userID,
			AssignmentStatusID: 1, // Pending
			AssignedAt:         time.Now(),
		}
		if err := s.DB.Create(&sa).Error; err != nil {
			return err
		}
	} else if err == nil {
		// อัปเดตเป็น Pending หากถูกยกเลิก
		if sa.AssignmentStatusID == 4 {
			sa.AssignmentStatusID = 1
			if err := s.DB.Save(&sa).Error; err != nil {
				return err
			}
		}
	} else {
		return err
	}

	// อัปเดต Assignment status อัตโนมัติ
	return s.UpdateAssignmentStatus(assignmentID)
}

// เปลี่ยนสถานะของตัวเอง (1:Pending,2:InProgress,3:Completed,4:Cancelled)
func (s *StaffAssignmentService) UpdateMyStatus(staffAssignmentID uint, userID uint, statusID uint) error {
	var sa entity.StaffAssignment
	if err := s.DB.First(&sa, staffAssignmentID).Error; err != nil {
		return err
	}

	if sa.UserID != userID {
		return ErrPermissionDenied
	}

	sa.AssignmentStatusID = statusID
	if err := s.DB.Save(&sa).Error; err != nil {
		return err
	}

	return s.UpdateAssignmentStatus(sa.AssignmentID)
}

// อัปเดต Assignment status ตาม StaffAssignments ทั้งหมด
func (s *StaffAssignmentService) UpdateAssignmentStatus(assignmentID uint) error {
	var staffAssignments []entity.StaffAssignment
	if err := s.DB.Where("assignment_id = ?", assignmentID).Find(&staffAssignments).Error; err != nil {
		return err
	}

	newStatus := uint(1) // Pending
	if len(staffAssignments) > 0 {
		allCompleted := true
		hasInProgress := false
		for _, staff := range staffAssignments {
			switch staff.AssignmentStatusID {
			case 2: // In Progress
				hasInProgress = true
				allCompleted = false
			case 3: // Completed
				// do nothing
			case 1, 4: // Pending / Cancelled
				allCompleted = false
			}
		}

		switch {
		case allCompleted:
			newStatus = 3 // Completed
		case hasInProgress:
			newStatus = 2 // In Progress
		default:
			newStatus = 1 // Pending
		}
	}

	return s.DB.Model(&entity.Assignment{}).
		Where("id = ?", assignmentID).
		Update("assignment_status_id", newStatus).Error
}
