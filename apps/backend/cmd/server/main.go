package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/rumbea/backend/internal/config"
	"github.com/rumbea/backend/internal/db"
	"github.com/rumbea/backend/internal/handlers"
	"github.com/rumbea/backend/internal/httpx"
	"github.com/rumbea/backend/internal/middleware"
	"github.com/rumbea/backend/internal/repository"
)

const version = "0.1.0"

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	healthH := &handlers.HealthHandler{
		HasDB:   cfg.HasDatabase(),
		HasAuth: cfg.HasAuth(),
		Version: version,
	}
	r.Get("/health", healthH.Health)
	r.Get("/", healthH.Health)

	if !cfg.HasDatabase() {
		log.Println("[WARN] DATABASE_URL vacío — el backend arranca en modo limitado (solo /health). Configura el .env para habilitar rutas de datos.")
		r.NotFound(func(w http.ResponseWriter, req *http.Request) {
			httpx.Error(w, http.StatusServiceUnavailable, "database not configured")
		})
	} else {
		pool, err := db.NewPool(ctx, cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("db connect: %v", err)
		}
		defer pool.Close()
		log.Println("[INFO] DB conectada")

		estRepo := repository.NewEstablishmentRepo(pool)
		favRepo := repository.NewFavoriteRepo(pool)
		linkRepo := repository.NewLinkRepo(pool)

		estH := handlers.NewEstablishmentHandler(estRepo)
		favH := handlers.NewFavoriteHandler(favRepo)
		linkH := handlers.NewLinkHandler(linkRepo)

		requireAuth := middleware.Auth(cfg.SupabaseJWTSecret, true)
		optionalAuth := middleware.Auth(cfg.SupabaseJWTSecret, false)

		// === Rutas públicas ===
		r.Route("/api/v1", func(api chi.Router) {
			api.Group(func(pub chi.Router) {
				pub.Use(optionalAuth)
				pub.Get("/establishments", estH.Search)
				pub.Get("/establishments/{id}", estH.GetByID)
				pub.Get("/establishments/{id}/links", linkH.List)
				pub.Get("/genres", estH.ListGenres)
			})

			// === Rutas autenticadas ===
			api.Group(func(priv chi.Router) {
				priv.Use(requireAuth)

				// establishments
				priv.Post("/establishments", estH.Create)
				priv.Patch("/establishments/{id}", estH.Update)
				priv.Patch("/establishments/{id}/occupancy", estH.UpdateOccupancy)
				priv.Delete("/establishments/{id}", estH.Delete)

				// links
				priv.Post("/establishments/{id}/links", linkH.Create)
				priv.Delete("/establishments/{id}/links/{linkId}", linkH.Delete)

				// favorites
				priv.Get("/favorites", favH.List)
				priv.Post("/favorites/{id}", favH.Add)
				priv.Delete("/favorites/{id}", favH.Remove)
			})
		})
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("[INFO] Rumbea API listening on :%s (env=%s)", cfg.Port, cfg.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("[INFO] shutting down...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
		os.Exit(1)
	}
	log.Println("[INFO] stopped cleanly")
}
