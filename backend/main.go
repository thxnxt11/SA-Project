package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/appsystem"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/booking"
	"github.com/yourname/went-back/controllers/promotion"
	"github.com/yourname/went-back/controllers/concert"
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
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
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

	    router.GET("/concerts", concert.GetAllConcerts)
	    router.POST("/concerts", concert.AddConcert)
	    router.PUT("/concerts/:id", concert.UpdateConcert)
	    router.DELETE("/concerts/:id", concert.DeleteConcert)

   	}
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.GET("/concerts", promotion.GetAllConcerts)
		api.POST("/upload",promotion.UploadFile)
		api.GET("/concert/:id", booking.GetConcertByID)
		api.GET("/showdate/:id/zones", booking.GetZonesByShowDate)
		
	}
	r.Static("/uploads", "./uploads")
	r.POST("/signup", appsystem.SignUp)
	r.POST("/signin", appsystem.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
