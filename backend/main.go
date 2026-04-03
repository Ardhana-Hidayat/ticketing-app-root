package main

import (
	"log"

	"mastutik-api/config"
	"mastutik-api/models"
	"mastutik-api/routes"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Izinkan semua origin
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func main() {
	// Connect to Database
	config.ConnectDB()

	// Auto-migrate tables
	log.Println("Migrating database models...")
	err := config.DB.AutoMigrate(&models.Event{})
	if err != nil {
		log.Printf("Warning: Failed to migrate database: %v", err)
	}

	// Initialize Router
	r := gin.Default()
	
	// Gunakan CORS Middleware
	r.Use(CORSMiddleware())

	// Setup Routes
	routes.SetupRoutes(r)

	// Start Server
	log.Println("Server is running on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}