package main

import (
	"fmt"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
    // "github.com/yourname/went-back/appsystem"
	// "github.com/yourname/went-back/controllers/user"
    "github.com/yourname/went-back/controllers/warehouse-shop"

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
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	// r.POST("/signup", appsystem.SignUp)
	// r.POST("/signin", appsystem.SignIn)

	// {warehouse}
	r.GET("/concerts", controllers.GetConcerts)
	r.GET("/categories", controllers.GetCategories)
	r.GET("/sizes", controllers.GetSizes)
	r.GET("/colors", controllers.GetColors)
	r.POST("/products", controllers.CreateProduct)
	r.GET("/products", controllers.FindProducts)
	r.GET("/products/:id", controllers.FindProductById)
	r.PUT("/products/:id", controllers.UpdateProduct)
	r.DELETE("/products/:id", controllers.DeleteProductById)
	r.DELETE("/variant/:id", controllers.DeleteVariantById)

	// r.Static("/uploads", "./uploads")
	// r.POST("/signup", user.SignUp)
	// r.POST("/signin", user.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}