package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/booking"
	"github.com/yourname/went-back/controllers/promotion"
	refund "github.com/yourname/went-back/controllers/refund"
	controllers "github.com/yourname/went-back/controllers/report"

	"github.com/yourname/went-back/controllers/user"
	"github.com/yourname/went-back/services"
)

func main() {
	// connect DB
	connection.ConnectionDB()
	connection.SetupDatabase()
	reportController := &controllers.ReportController{}

	refundController := &refund.RefundController{}
	if err := services.RecalculateAllZones(connection.DB()); err != nil {
		panic(fmt.Sprintf("failed to recalc zone counters: %v", err))
	}

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// setup gin
	r := gin.Default()
	connection.SeedSeats(1, []string{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"}, 15)
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, accept, origin, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	router := r.Group("/organizer")
	{
		// promotion Route
		router.POST("/promotion/add", promotion.CreatePromotion)
		router.GET("/promotion/:id", promotion.GetPromotionByID)
		router.PUT("/promotion/:id", promotion.UpdatePromotion)
		router.GET("/promotion", promotion.GetAllPromotions)
		router.DELETE("/promotion/:id", promotion.DeletePromotion)
	}
	zoneSvc := services.NewZoneService()
	zoneCtl := booking.NewZoneController(zoneSvc)

	bookingHandler := booking.NewBookingHandler()

	svc := services.NewBookingService()
	services.StartExpiryWorker(svc) // เริ่ม worker เพื่อลบ Booking ที่หมดเวลา

	promotionCtl := promotion.NewPromotionController()

	r.Static("/uploads", "./uploads")
	// API routes
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.POST("/upload", promotion.UploadFile)
		api.GET("/concerts", booking.GetAllConcerts)
		api.GET("/concert/:id", booking.GetConcertByID)
		api.GET("/showdate/:id/zones", zoneCtl.GetZonesAvailableByShowDate)
		api.GET("/zone/:id/seats", bookingHandler.GetSeatByZoneID)
		api.POST("/booking", bookingHandler.CreateBooking)
		api.POST("/promotion/validate", promotionCtl.ValidatePromotionCode)
		api.GET("/refundtypes", booking.GetRefundTypes)
		api.GET("/paymentmethods", booking.GetAllPaymentMethods)
		api.POST("/payment", booking.CreatePayment)
		api.PUT("/payment/:id/receipt", booking.UpdatePaymentReceipt)
		api.GET("/report-types", reportController.GetReportTypes)
		api.POST("/reports/:user_id/user", reportController.CreateReport)
		api.GET("/reports/history/:user_id", controllers.GetReportHistory)
		api.GET("/users/:user_id/bookings", refundController.GetUserBookings)
		api.GET("/users/:user_id/refundable-bookings", refundController.GetRefundableBookings)
		api.GET("/banks", refundController.GetBankOptions)
		api.POST("/users/:user_id/refunds", refundController.CreateRefund)
		api.GET("/refunds/history/:user_id", refund.GetRefundHistory)
		api.DELETE("/refunds/:id", refund.DeleteRefund)
	}

	r.POST("/signup", user.SignUp)
	r.POST("/signin", user.SignIn)
	r.POST("/forget-password", user.ForgetPassword)
	r.POST("/reset-password", user.ResetPassword)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
