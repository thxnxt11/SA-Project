package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/controllers"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/booking"
	"github.com/yourname/went-back/controllers/promotion"
)

func main() {
	// connect DB
	connection.ConnectionDB()
	connection.SetupDatabase()

	// setup gin
	r := gin.Default()
	connection.SeedSeats(1, []string{"A", "B", "C", "D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"}, 15)
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
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.POST("/upload",promotion.UploadFile)
		api.GET("/concerts", booking.GetAllConcerts)
		api.GET("/concert/:id", booking.GetConcertByID)
		bookingHandler := booking.NewBookingHandler()
		api.GET("/zone/:id/seats",bookingHandler.GetSeatByZoneID)
		// api.GET("/showdate/:id/zones", booking.GetZonesByShowDate)
		
	}
	r.Static("/uploads", "./uploads")
	r.POST("/signup", appsystem.SignUp)
	r.POST("/signin", appsystem.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
