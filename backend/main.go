package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"

	staffassignmentController "github.com/yourname/went-back/controller/assignment"
	"github.com/yourname/went-back/controller/user"
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

	equipmentController "github.com/yourname/went-back/controller/venue"
	equipmentService "github.com/yourname/went-back/service/venue"
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

	equipService := &equipmentService.EquipmentService{DB: connection.DB()}
	equipCtrl := &equipmentController.EquipmentController{Service: equipService}

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
		api.POST("/staff/assignments/:id/accept", staffAssignCtrl.AcceptAssignment)
		api.PUT("/staff/staff_assignments/:id/status", staffAssignCtrl.UpdateMyStatus)

		api.GET("/staff/:user_id/assignments", staffAssignCtrl.GetMyAssignments)

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
		api.DELETE("/stages/:id",venueController.DeleteStage)
		api.DELETE("/stages_equipments/:id",venueController.DeleteEquipment)


		// ----- StageType / VenueType / EquipmentType -----
		api.GET("/venuetypes", venueController.GetVenueTypes)
		api.GET("/stagetypes", venueController.GetStageTypes)
		api.GET("/equipmenttypes", equipCtrl.GetEquipmentTypes)

		// ----- Equipment -----
		api.GET("/equipments", equipCtrl.GetAllEquipment)        // ดึงอุปกรณ์ทั้งหมด
		api.GET("/equipments/:id", equipCtrl.GetEquipmentByID)   // ดึงอุปกรณ์ตาม ID
		api.POST("/equipments", equipCtrl.Create)       // เพิ่มอุปกรณ์ใหม่
		api.PUT("/equipments/:id", equipCtrl.Update)    // แก้ไขอุปกรณ์
		api.DELETE("/equipments/:id", equipCtrl.Delete) // ลบอุปกรณ์

		// Stock / Stage Assignment
		api.POST("/equipments/:id/assign", equipCtrl.AssignToStage)     // Assign อุปกรณ์ให้ Stage
		api.GET("/equipments/available", equipCtrl.GetAvailableByStage) // ดึงอุปกรณ์ที่ยังใช้งานได้

		// auth
		r.POST("/signup", user.SignUp)
		r.POST("/signin", user.SignIn)

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
