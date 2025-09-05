package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/booking"
	"github.com/yourname/went-back/controllers/promotion"
	"github.com/yourname/went-back/controllers/user"
	"github.com/yourname/went-back/services"
)

func main() {
	// connect DB
	connection.ConnectionDB()
	connection.SetupDatabase()
	if err := services.RecalculateAllZones(connection.DB()); err != nil {
        panic(fmt.Sprintf("failed to recalc zone counters: %v", err))
    }

	// setup gin
	r := gin.Default()
	// connection.SeedSeats(1, []string{"A", "B", "C", "D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"}, 15)
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization") 
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

	eTicketCtl := booking.NewEticketController()
	// API routes
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.POST("/upload",promotion.UploadFile)
		api.GET("/concerts", booking.GetAllConcerts)
		api.GET("/concert/:id", booking.GetConcertByID)
		api.GET("/showdate/:id/zones", zoneCtl.GetZonesAvailableByShowDate)
		api.GET("/zone/:id/seats",bookingHandler.GetSeatByZoneID)
		api.POST("/booking",bookingHandler.CreateBooking)
		api.POST("/promotion/validate", promotionCtl.ValidatePromotionCode)
		api.GET("/refundtypes", booking.GetRefundTypes)
		api.GET("/paymentmethods", booking.GetAllPaymentMethods)
		api.POST("/payment", booking.CreatePayment)
		api.PUT("/payment/:id/receipt", booking.UpdatePaymentReceipt)
		api.GET("/concert/:id/user",booking.GetConcertsByUserID)
		api.GET("/e-tickets/booking/:booking_id",eTicketCtl.GetETicketByBookingID)
		api.GET("/e-tickets/:user_id/user",eTicketCtl.GetMyTicketCards)
		api.GET("/eticket/user/:user_id/concert/:concert_id/show/:show_date_id",eTicketCtl.GetETicketByShowID)
		api.GET("/user/:user_id",user.GetUserDataById)
		api.GET("/genders",user.GetAllGender)
		api.PUT("/user/:user_id",user.UpdateUserDataById)
		
	}
	r.Static("/uploads", "./uploads")
	r.POST("/signup", user.SignUp)
	r.POST("/signin", user.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
