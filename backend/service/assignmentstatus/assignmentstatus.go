package service

import (
    "github.com/yourname/went-back/entity"
    "gorm.io/gorm"
)

type AssignmentStatusService struct {
    DB *gorm.DB
}

func (s *AssignmentStatusService) GetAll() ([]entity.AssignmentStatus, error) {
    var statuses []entity.AssignmentStatus
    err := s.DB.Find(&statuses).Error
    return statuses, err
}
