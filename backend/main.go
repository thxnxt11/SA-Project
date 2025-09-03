package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/booking"
	"github.com/yourname/went-back/controllers/concert"
	"github.com/yourname/went-back/controllers/zone"
	"github.com/yourname/went-back/controllers/promotion"
	"github.com/yourname/went-back/controllers/user"
)

func main() {
	// connect DB & migrate
	connection.ConnectionDB()
	connection.SetupDatabase()

	// seed seats (keep yours)
	connection.SeedSeats(1, []string{
		"A","B","C","D","E","F","G","H","I","J",
		"K","L","M","N","O","P","Q","R","S",
	}, 15)

	// gin engine
	r := gin.Default()

	// avoid "You trusted all proxies" warning
	_ = r.SetTrustedProxies(nil)

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Vary", "Origin")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent) // 204 for preflight
			return
		}
		c.Next()
	})

	// health check (used by your Loader)
	r.GET("/healthz", func(c *gin.Context) {
		sqlDB, err := connection.DB().DB()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "db handle error", "error": err.Error()})
			return
		}
		if err := sqlDB.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "db down", "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// organizer routes
	router := r.Group("/organizer")
	{
		// promotion
		router.POST("/promotion/add", promotion.CreatePromotion)
		router.GET("/promotion/:id", promotion.GetPromotionByID)
		router.PUT("/promotion/:id", promotion.UpdatePromotion)
		router.GET("/promotion", promotion.GetAllPromotions)
		router.DELETE("/promotion/:id", promotion.DeletePromotion)

		// concerts CRUD
		router.GET("/concerts", concert.GetAllConcerts)
		router.POST("/concerts", concert.AddConcert)
		router.PUT("/concerts/:id", concert.UpdateConcert)
		router.DELETE("/concerts/:id", concert.DeleteConcert)
		router.GET("/venues/option",concert.GetAllVenues)

		router.POST("/showdate", concert.AddShowdate)
		router.PUT("/showdate/:id", concert.UpdateShowdate)
		router.DELETE("/showdate/:id", concert.DeleteShowdate)
		router.DELETE("/showdateid/:id",concert.DeleteShowdatebyid)

		router.GET("/zoneconcert/:user_id", zone.GetConcertsByUserID)
		router.GET("/zoneshowdate/:id", zone.GetShowDatesByConcertID)
		router.GET("/zonetype", zone.ListZoneTypes)

		router.GET("/zone/:id", zone.GetZonesByShowDateID)
		router.PUT("/zone/:id", zone.UpdateZone)
		router.POST("/zone", zone.AddZone)
		router.DELETE("/zone/:id",zone.DeleteZone)

		router.GET("/seatzone/:id",zone.GetseatzonesByzoneID)
		router.POST("/seatzone/:id",zone.Addseatzone)
		router.DELETE("/seatzone/:id",zone.Deleteseatzone)
		router.PUT("/seatzone/:id/seat/:seat_id",zone.UpdateSeatzone)

	}

	// public API
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.GET("/concerts", promotion.GetAllConcerts)
		api.POST("/upload", promotion.UploadFile)
		api.GET("/concert/:id", booking.GetConcertByID)
		api.GET("/showdate/:id/zones", booking.GetZonesByShowDate)
	}

	// static uploads
	r.Static("/uploads", "./uploads")

	// auth
	r.POST("/signup", user.SignUp)
	r.POST("/signin", user.SignIn)

	fmt.Println("Server running on http://localhost:8000")
	// NOTE: if you see "bind: Only one usage of each socket address",
	// stop the previous process using port 8000 or change the port.
	r.Run(":8000")
}
