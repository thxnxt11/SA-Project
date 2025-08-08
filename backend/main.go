package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/appsystem"
)

func main() {
	// connect DB
	connection.ConnectionDB()
	connection.SetupDatabase()

	// setup gin
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})


	r.POST("/signup", appsystem.SignUp)
	r.POST("/signin", appsystem.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}
