package routes

import (
	"mastutik-api/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "OK",
			"message": "Connection Successfully! 🚀",
		})
	})

	api := r.Group("/api")
	{
		// Public routes
		api.GET("/events", controllers.GetPublicEvents)

		// Admin routes
		admin := api.Group("/admin")
		{
			events := admin.Group("/events")
			{
				events.POST("", controllers.CreateEvent)
				events.GET("", controllers.GetEvents)
				events.GET("/:id", controllers.GetEventByID)
				events.PUT("/:id", controllers.UpdateEvent)
				events.DELETE("/:id", controllers.DeleteEvent)
			}
		}
	}
}
