package main

import (
	"log"
	"mastutik-api/config"
	"mastutik-api/routes" // pastikan path import ini bener ya ar

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
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
	// 1. Inisialisasi Database
	config.ConnectDB()

	r := gin.Default()

	// 2. Pasang Middleware CORS
	r.Use(CORSMiddleware())

	// 3. Rute statis buat gambar
	r.Static("/uploads", "./uploads/images")

	// 4. PANGGIL SETUP ROUTES (ini kuncinya, ar!)
	// hapus group api/admin manual yang tadi di main, 
	// biarin file routes.go yang nanganin semuanya.
	routes.SetupRoutes(r)

	log.Println("server running at http://localhost:8080 🚀")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}