package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"

	staffassignmentController "github.com/yourname/went-back/controller/assignment"
	staffassignmentService "github.com/yourname/went-back/service/assignment"

	assignmentController "github.com/yourname/went-back/controller/assignment"
	staffController "github.com/yourname/went-back/controller/staff"
	controller "github.com/yourname/went-back/controller/venue"

	assignmentService "github.com/yourname/went-back/service/assignment"
	staffService "github.com/yourname/went-back/service/staff"
	service "github.com/yourname/went-back/service/venue"

	assignmentStatusController "github.com/yourname/went-back/controller/assignmentstatus"
	showDateController "github.com/yourname/went-back/controller/showdate"
	assignmentStatusService "github.com/yourname/went-back/service/assignmentstatus"
	showDateService "github.com/yourname/went-back/service/showdate"
)

func main() {
	// ================= Database =================
	connection.ConnectionDB()
	connection.SetupDatabase()

	// ================= Services & Controllers =================
	userService := &staffService.UserService{DB: connection.DB()}
	assignmentSvc := &assignmentService.AssignmentService{DB: connection.DB()}

	staffAssignService := &staffassignmentService.StaffAssignmentService{DB: connection.DB()}
	staffAssignCtrl := &staffassignmentController.StaffAssignmentController{Service: staffAssignService}


	staffCtrl := &staffController.UserController{Service: userService}
	assignCtrl := &assignmentController.AssignmentController{Service: assignmentSvc}

	showDateService := &showDateService.ShowDateService{DB: connection.DB()}
	showDateController := &showDateController.ShowDateController{Service: showDateService}

	assignmentStatusService := &assignmentStatusService.AssignmentStatusService{DB: connection.DB()}
	assignmentStatusController := &assignmentStatusController.AssignmentStatusController{Service: assignmentStatusService}

	venueService := &service.VenueService{DB: connection.DB()}
	venueController := &controller.VenueController{VenueService: venueService}

	// stageService := &service.StageService{DB: connection.DB()}
	// stageController := &controller.StageController{StageService: stageService}

	// ================= Gin Router =================
	r := gin.Default()

	// ===== CORS Middleware =====
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// ================= API Routes =================
	api := r.Group("/api")
	{
		// ----- User / Staff -----
		api.POST("/users", staffCtrl.CreateUser)
		api.GET("/users", staffCtrl.GetUsers)
		api.GET("/users/:id", staffCtrl.GetUserByID)
		api.PUT("/users/:id", staffCtrl.UpdateUser)
		api.DELETE("/users/:id", staffCtrl.DeleteUser)

		api.GET("/genders", staffCtrl.GetGenders)
		api.GET("/roles", staffCtrl.GetRoles)
		api.GET("/departments", staffCtrl.GetDepartments)
		api.GET("/positions", staffCtrl.GetPositions)

		// ----- Assignment -----
		api.GET("/assignments", assignCtrl.GetAssignments)
		api.GET("/assignments/:id", assignCtrl.GetAssignmentByID)
		api.POST("/assignments", assignCtrl.CreateAssignment)
		api.PUT("/assignments/:id", assignCtrl.UpdateAssignment)
		api.DELETE("/assignments/:id", assignCtrl.DeleteAssignment)

		// ----- Staff Assignment -----
		api.GET("/staff/assignments", staffAssignCtrl.GetMyAssignments)
		api.POST("/staff/assignments/:id/accept", staffAssignCtrl.AcceptAssignment)
		api.PUT("/staff/staff_assignments/:id/status", staffAssignCtrl.UpdateMyStatus)
		// ----- ShowDate / Status / Concert -----

		api.GET("/assignment_statuses", assignmentStatusController.GetAllStatuses)
		api.GET("/showdates", showDateController.GetShowDates)
		api.GET("/showdates/:id", showDateController.GetShowDate)




		// ----- Venue + Stage รวมกัน -----
		api.GET("/venues", venueController.GetAllVenues)
		api.GET("/venues/:id", venueController.GetVenue)
		api.POST("/venues", venueController.CreateVenue)
		api.PUT("/venues/:id", venueController.UpdateVenue)
		api.DELETE("/venues/:id", venueController.DeleteVenue)

		// ----- StageType / VenueType / EquipmentType -----
		api.GET("/venuetypes", venueController.GetVenueTypes)
		api.GET("/stagetypes", venueController.GetStageTypes)
		api.GET("/equipmenttypes", venueController.GetEquipmentTypes)

		// // ----- Venue / Stage -----
		// api.GET("/venues", venueController.GetAllVenues)
		// api.GET("/venues/:id", venueController.GetVenue)
		// api.POST("/venues", venueController.CreateVenue)
		// api.PUT("/venues/:id", venueController.UpdateVenue)
		// api.DELETE("/venues/:id", venueController.DeleteVenue)

		// api.GET("/stages", stageController.GetAllStages)
		// api.GET("/stages/:id", stageController.GetStage)
		// api.POST("/stages", stageController.CreateStage)
		// api.PUT("/stages/:id", stageController.UpdateStage)
		// api.DELETE("/stages/:id", stageController.DeleteStage)
		

	}

	// ================= Root Route =================
	r.GET("/", func(c *gin.Context) {
		c.String(200, "User & Assignment API is running on port 8000")
	})

	fmt.Println("Server running on http://localhost:8000")
	if err := r.Run(":8000"); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
