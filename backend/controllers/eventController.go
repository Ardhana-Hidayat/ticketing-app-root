package controllers

import (
	"net/http"
	"strconv"

	"mastutik-api/config"
	"mastutik-api/models"

	"github.com/gin-gonic/gin"
)

// GetPublicEvents digunakan untuk mengambil list event untuk public frontend
func GetPublicEvents(c *gin.Context) {
	// 1. Ambil Query Parameter untuk pagination (limit & page)
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	// Validasi nilai
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var events []models.Event
	var total int64

	// 2. Hitung total data yang aktif
	if err := config.DB.Model(&models.Event{}).Where("is_active = ?", true).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count events"})
		return
	}

	// 3. Query SELECT ke database menggunakan ORM (GORM) dengan Limit dan Offset
	if err := config.DB.Where("is_active = ?", true).Limit(limit).Offset(offset).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	// Hitung total page
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	// 4. Return respon dalam struktur JSON
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   events,
		"meta": gin.H{
			"total":        total,
			"current_page": page,
			"total_pages":  totalPages,
			"limit":        limit,
		},
	})
}