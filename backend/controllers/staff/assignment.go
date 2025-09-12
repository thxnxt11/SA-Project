package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/services"
)

type AssignmentController struct {
	Service *services.AssignmentService
}

func (ctrl *AssignmentController) GetAssignments(c *gin.Context) {
	assignments, err := ctrl.Service.GetAllAssignments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, assignments)
}

func (ctrl *AssignmentController) GetAssignmentByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	assignment, err := ctrl.Service.GetAssignmentByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}
	c.JSON(http.StatusOK, assignment)
}

func (ctrl *AssignmentController) CreateAssignment(c *gin.Context) {
	var input services.AssignmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment, err := ctrl.Service.CreateAssignment(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, assignment)
}

func (ctrl *AssignmentController) UpdateAssignment(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var input services.AssignmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assignment, err := ctrl.Service.UpdateAssignment(uint(id), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assignment)
}

func (ctrl *AssignmentController) DeleteAssignment(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := ctrl.Service.DeleteAssignment(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assignment deleted"})
}
