package main

import (
	"log"
	"os"

	"github.com/KIRRUU0/Website-Kasir/internal/delivery/http/handler"
	"github.com/KIRRUU0/Website-Kasir/internal/delivery/http/middleware"
	"github.com/KIRRUU0/Website-Kasir/internal/model"
	"github.com/KIRRUU0/Website-Kasir/internal/repository"
	"github.com/KIRRUU0/Website-Kasir/internal/usecase"
	"github.com/KIRRUU0/Website-Kasir/pkg/database"
	"github.com/KIRRUU0/Website-Kasir/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. LOAD ENVIRONMENT VARIABLES
	// Pastikan file .env ada di root folder backend
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// 2. INITIALIZE DATABASES
	// Koneksi ke MySQL (GORM) dan Redis
	db := database.InitMySQL()
	rdb := database.InitRedis()

	// 3. AUTO MIGRATION
	// Membuat tabel otomatis berdasarkan struct di internal/model
	err := db.AutoMigrate(
		&model.User{},
		&model.Product{},
		&model.StockAllocation{},
		&model.Transaction{},
	)
	if err != nil {
		log.Fatal("Migration Failed: ", err)
	}

	// 4. INITIALIZE HANDLERS & SERVICES
	// WebSocket Handler (untuk notifikasi real-time Ojol)
	wsHandler := handler.NewWSHandler()

	// Repository Layer
	stockRepo := repository.NewStockRepository(db, rdb)

	// Usecase Layer (Business Logic)
	// Kita passing wsHandler ke Usecase agar bisa kirim notifikasi saat stok berubah
	stockUC := usecase.NewStockUsecase(stockRepo, wsHandler)

	// Delivery Layer (HTTP Handlers)
	stockHandler := handler.NewStockHandler(stockUC)

	// 5. SETUP GIN ROUTER
	r := gin.Default()

	// CORS Middleware (Penting agar Frontend React bisa akses Backend)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// --- ROUTES ---

	// A. Public Routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "Server is running 🚀", "database": "Connected"})
	})

	// WebSocket Endpoint (Front-end akan konek ke ws://localhost:8080/ws)
	r.GET("/ws", wsHandler.ServeWS)

	// Login Endpoint (Dummy Auth untuk testing)
	r.POST("/api/v1/login", func(c *gin.Context) {
		// Logika: User input username/pass -> Check DB -> Generate Token
		// Untuk testing, kita langsung berikan token admin
		token, err := utils.GenerateToken(1, "admin")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate token"})
			return
		}
		c.JSON(200, gin.H{"token": token, "role": "admin"})
	})

	// B. Protected Routes (Perlu JWT Token)
	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware()) 
	{
		// Endpoint Checkout (Bisa diakses Kasir & Admin)
		// Contoh URL: POST /api/v1/checkout?product_id=1&qty=2&type=online
		api.POST("/checkout", stockHandler.Checkout)

		// C. Admin Only Routes
		admin := api.Group("/admin")
		admin.Use(middleware.AdminOnly())
		{
			admin.POST("/add-product", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Fitur tambah produk hanya untuk Admin"})
			})
			
			// Tambahkan endpoint operasional toko di sini nanti
			admin.POST("/toggle-store", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Toko berhasil di-toggle"})
			})
		}
	}

	// 6. START SERVER
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("-----------------------------------------")
	log.Printf("🚀 Kasir App Backend running on port %s", port)
	log.Printf("-----------------------------------------")
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Unable to start server: ", err)
	}
}