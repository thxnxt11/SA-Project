package main

import (
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"

    "github.com/yourname/went-back/connection"
    "github.com/yourname/went-back/appsystem"
)

func main() {
    // 1. Init DB, migrate & seed
    connection.ConnectionDB()
    connection.SetupDatabase()

    // 2. Create router
    r := gin.Default()

    // 3. CORS middleware for your frontend
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // 4. Auth endpoints
    r.POST("/signup", appsystem.SignUp)
    r.POST("/signin", appsystem.SignIn)

    // 5. Simple health‐check
    r.GET("/", func(c *gin.Context) {
        c.String(200, "Auth service running")
    })

    // 6. Start server on :8000
    if err := r.Run(":8000"); err != nil {
        panic(err)
    }
}
