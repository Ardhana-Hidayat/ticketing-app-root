package controllers

import (
    "fmt"        
    "net/http"
    "os"         
    "path/filepath" 
    "time"
    "mastutik-api/config"
    "mastutik-api/models"
    "github.com/gin-gonic/gin"
)

func CreateEvent(c *gin.Context) {
    // 1. Ambil file gambar
    file, err := c.FormFile("image")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "gambarnya mana ar? lupa upload ya?"})
        return
    }

    filename := fmt.Sprintf("%d-%s", time.Now().Unix(), filepath.Base(file.Filename))
    uploadPath := "uploads/images/" + filename

    if err := c.SaveUploadedFile(file, uploadPath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal nyimpen gambar di server vps"})
        return
    }

    dateStr := c.PostForm("date")
    eventDate, _ := time.Parse("2006-01-02T15:04:05Z07:00", dateStr)

    event := models.Event{
        Title:       c.PostForm("title"),
        Description: c.PostForm("description"),
        Location:    c.PostForm("location"),
        Date:        eventDate,
        Image:       filename, 
        IsActive:    true,
    }

    if err := config.DB.Create(&event).Error; err != nil {
        os.Remove(uploadPath) 
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan ke database: " + err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "event berhasil dipublish ke vps!",
        "data":    event,
    })
}

func GetEvents(c *gin.Context) {
	var events []models.Event

	if err := config.DB.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": events})
}

func GetEventByID(c *gin.Context) {
    id := c.Param("id")
    var event models.Event
    if err := config.DB.First(&event, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "event gaib, gak ketemu!"})
        return
    }
    c.JSON(200, gin.H{"data": event})
}

// UpdateEvent buat ngedit data yang sudah ada
func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "event nggak ketemu ar!"})
		return
	}

	// Cek kalau ada upload gambar baru
	file, err := c.FormFile("image")
	if err == nil {
		// Hapus gambar lama biar vps nggak penuh dhan
		if event.Image != "" {
			os.Remove("uploads/images/" + event.Image)
		}
		
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), filepath.Base(file.Filename))
		c.SaveUploadedFile(file, "uploads/images/"+filename)
		event.Image = filename
	}

	// Update data teks
	event.Title = c.PostForm("title")
	event.Description = c.PostForm("description")
	event.Location = c.PostForm("location")
	dateStr := c.PostForm("date")
	event.Date, _ = time.Parse(time.RFC3339, dateStr)

	if err := config.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal update database dhan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event berhasil di-update! 🛠️", "data": event})
}

// DeleteEvent buat hapus permanen
func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "mau hapus apa ar? eventnya aja gak ada"})
		return
	}

	// Hapus file fisiknya di vps juga ar
	if event.Image != "" {
		os.Remove("uploads/images/" + event.Image)
	}

	config.DB.Delete(&event)
	c.JSON(http.StatusOK, gin.H{"message": "event sukses dihapus! 🗑️"})
}