package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"user-management-backend/internal/config"
	"user-management-backend/internal/database"
	"user-management-backend/internal/handler"
	"user-management-backend/internal/repository"
	"user-management-backend/internal/service"
)

func main() {
	cfg := config.Load()

	log.Printf("Starting User Management Backend on port %d...", cfg.Port)

	// Connect to PostgreSQL
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}
	defer db.Close()

	// Run Schema Migration
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	// Run Seed Data
	if err := database.Seed(db); err != nil {
		log.Fatalf("Database seeding failed: %v", err)
	}

	// Initialize Layers
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	// Router setup
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS configuration for frontend
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allow all origins for dev flexibility
		AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
	})

	// Register API Routes
	userHandler.RegisterRoutes(r)

	// HTTP Server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server run context with graceful shutdown
	serverCtx, serverStopCtx := context.WithCancel(context.Background())

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	go func() {
		<-sig

		shutdownCtx, cancel := context.WithTimeout(serverCtx, 10*time.Second)
		defer cancel()

		go func() {
			<-shutdownCtx.Done()
			if shutdownCtx.Err() == context.DeadlineExceeded {
				log.Fatal("Graceful shutdown timed out.. forcing exit.")
			}
		}()

		log.Println("Shutting down HTTP server...")
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("Server shutdown error: %v", err)
		}
		serverStopCtx()
	}()

	log.Printf("User Management API server listening on http://localhost:%d", cfg.Port)
	log.Printf("Endpoints:")
	log.Printf("  - GET   /api/v1/users?page=1&limit=10&search=amin")
	log.Printf("  - GET   /api/v1/users/:id")
	log.Printf("  - PATCH /api/v1/users/:id/status")
	log.Printf("  - GET   /health")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server listen error: %v", err)
	}

	<-serverCtx.Done()
	log.Println("Server stopped cleanly.")
}
