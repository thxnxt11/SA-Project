package main

import (
	"fmt"
    "github.com/gin-gonic/gin"
    "github.com/yourname/went-back/connection"
	"github.com/yourname/went-back/controllers/user"
	"github.com/yourname/went-back/controllers/promotion"
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
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS,PATCH, GET, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
	// zoneSvc := services.NewZoneService()
	// zoneCtl := booking.NewZoneController(zoneSvc)

	// bookingHandler := booking.NewBookingHandler()

	// svc := services.NewBookingService()
	// services.StartExpiryWorker(svc) // เริ่ม worker เพื่อลบ Booking ที่หมดเวลา

	promotionCtl := promotion.NewPromotionController()

	// eTicketCtl := booking.NewEticketController()
	// API routes
	api := r.Group("/api")
	{
		api.GET("/promotions", promotion.GetAllPromotionTypes)
		api.POST("/upload",promotion.UploadFile)
		// api.GET("/concerts", booking.GetAllConcerts)
		// api.GET("/concert/:id", booking.GetConcertByID)
		// api.GET("/showdate/:id/zones", zoneCtl.GetZonesAvailableByShowDate)
		// api.GET("/zone/:id/seats",bookingHandler.GetSeatByZoneID)
		// api.POST("/booking",bookingHandler.CreateBooking)
		api.POST("/promotion/validate", promotionCtl.ValidatePromotionCode)
		// api.GET("/refundtypes", booking.GetRefundTypes)
		// api.GET("/paymentmethods", booking.GetAllPaymentMethods)
		// api.POST("/payment", booking.CreatePayment)
		// api.PUT("/payment/:id/receipt", booking.UpdatePaymentReceipt)
		// api.GET("/concert/:id/user",booking.GetConcertsByUserID)
		// api.GET("/e-tickets/booking/:booking_id",eTicketCtl.GetETicketByBookingID)
		// api.GET("/e-tickets/:user_id/user",eTicketCtl.GetMyTicketCards)
		// api.GET("/eticket/user/:user_id/concert/:concert_id/show/:show_date_id",eTicketCtl.GetETicketByShowID)
		// api.GET("/user/:user_id",user.GetUserDataById)
		// api.GET("/genders",user.GetAllGender)
		// api.PUT("/user/:user_id",user.UpdateUserDataById)
		
	}

	// {warehouse}
	r.GET("/concerts", controllers.GetConcerts)
	r.GET("/categories", controllers.GetCategories)
	r.GET("/sizes", controllers.GetSizes)
	r.GET("/colors", controllers.GetColors)
	r.POST("/products", controllers.CreateProduct)
	r.GET("/products", controllers.FindProducts)
	r.GET("/products/:id", controllers.FindProductDetail)
	r.PUT("/products/:id", controllers.UpdateProduct)
	r.DELETE("/products/:id", controllers.DeleteProductById)
	r.DELETE("/variant/:id", controllers.DeleteVariantById)
	r.GET("/stockmovements", controllers.GetStockMovements)
	r.POST("/payment-orders/create", controllers.CreatePaymentOrder)
	r.GET("/payment-orders/methods",controllers.GetAllPaymentMethods)
	r.GET("/payment-orders/:id",controllers.GetPaymentOrderByID)
	r.PUT("/payment-orders/:id", controllers.UpdatePaymentOrder)
	r.PUT("/payment-orders/:id/expire",controllers.ExpirePaymentOrder)

	cartGroup := r.Group("/cart")
	{
		cartGroup.POST("/add", controllers.AddToCart)        // เพิ่มสินค้า
		cartGroup.GET("/:user_id", controllers.GetCartByUserID) // แสดงตะกร้า
		cartGroup.PUT("/item/:id", controllers.UpdateCartItem)  // อัปเดตจำนวน
		cartGroup.DELETE("/item/:id", controllers.RemoveCartItem) // ลบสินค้า
		cartGroup.PATCH("/items/:id/select",controllers.UpdateCartItemSelected)//เลือกสินค้าในตะกร้า
	}

	r.Static("/uploads", "./uploads")
	r.POST("/signup", user.SignUp)
	r.POST("/signin", user.SignIn)

	// start
	fmt.Println("Server running on http://localhost:8000")
	r.Run(":8000")
}