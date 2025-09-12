package controller

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/services"
)

type AssignmentStatusController struct {
    Service *services.AssignmentStatusService
}

func (ctrl *AssignmentStatusController) GetAllStatuses(c *gin.Context) {
    statuses, err := ctrl.Service.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, statuses)
}
