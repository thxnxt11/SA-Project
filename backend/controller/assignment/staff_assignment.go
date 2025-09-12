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
// GET /staff/assignments
func (ctrl *StaffAssignmentController) GetMyAssignments(c *gin.Context) {
	uIdStr := c.Param("user_id")
	userID, err := strconv.ParseUint(uIdStr, 10, 32)
	assignments, err := ctrl.Service.GetMyAssignments(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": assignments})
}

// POST /staff/assignments/:id/accept
func (ctrl *StaffAssignmentController) AcceptAssignment(c *gin.Context) {
	assignIdStr := c.Param("assignment_id")
	assignID,err := strconv.ParseUint(assignIdStr,10,32) 
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment_id"})
	} 
	uIdStr := c.Param("user_id")
	userID,err := strconv.ParseUint(uIdStr,10,32)
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
	}


	if err := ctrl.Service.AcceptAssignment(uint(assignID), uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment accepted"})
}

// PUT /staff/staff_assignments/:id/status
func (ctrl *StaffAssignmentController) UpdateMyStatus(c *gin.Context) {
	staffAssignIdStr := c.Param("staff-assignment_id")
	staffAssignID ,err := strconv.ParseUint(staffAssignIdStr,10,32)
	if err != nil{
		c.JSON(http.StatusBadRequest,gin.H{"error": "Invalid staff-assignment_id"})
		return
	}
	uIdStr := c.Param("user_id")
	userID,err := strconv.ParseUint(uIdStr,10,32)
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	var body struct {
		StatusID uint `json:"status_id"` // 1-4
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if err := ctrl.Service.UpdateMyStatus(uint(staffAssignID), uint(userID), body.StatusID); err != nil {
		if err == service.ErrPermissionDenied {
			c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated"})
}