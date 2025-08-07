package main

import (
	"fmt"
	
	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/appsystem"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/promotion"
)

func main() {
	// connect DB
	connection.ConnectionDB()
	connection.SetupDatabase()

	// setup gin
	r := gin.Default()
	
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
   	}
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.GET("/concerts", promotion.GetAllConcerts)
		api.POST("/upload",promotion.UploadFile)
		
	}
	r.Static("/uploads", "./uploads")
	r.POST("/signup", appsystem.SignUp)
	r.POST("/signin", appsystem.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
