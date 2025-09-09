package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/service/assignment"
)

type StaffAssignmentController struct {
	Service *service.StaffAssignmentService
}

// helper ดึง user_id จาก context
func getCurrentUserID(c *gin.Context) uint {
	if userID, exists := c.Get("user_id"); exists {
		return userID.(uint)
	}
	return 0
}

// GET /staff/assignments
func (ctrl *StaffAssignmentController) GetMyAssignments(c *gin.Context) {
	userID := getCurrentUserID(c)
	assignments, err := ctrl.Service.GetMyAssignments(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// POST /staff/assignments/:id/accept
func (ctrl *StaffAssignmentController) AcceptAssignment(c *gin.Context) {
	assignmentID, _ := strconv.Atoi(c.Param("id"))
	userID := getCurrentUserID(c)

	if err := ctrl.Service.AcceptAssignment(uint(assignmentID), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment accepted"})
}

// PUT /staff/staff_assignments/:id/status
func (ctrl *StaffAssignmentController) UpdateMyStatus(c *gin.Context) {
	saID, _ := strconv.Atoi(c.Param("id"))
	userID := getCurrentUserID(c)

	var body struct {
		StatusID uint `json:"status_id"` // 1-4
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := ctrl.Service.UpdateMyStatus(uint(saID), userID, body.StatusID); err != nil {
		if err == service.ErrPermissionDenied {
			c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}
