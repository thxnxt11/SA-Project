package assignmentstatus

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/service/assignmentstatus"
)

type AssignmentStatusController struct {
    Service *service.AssignmentStatusService
}

func (ctrl *AssignmentStatusController) GetAllStatuses(c *gin.Context) {
    statuses, err := ctrl.Service.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, statuses)
}
