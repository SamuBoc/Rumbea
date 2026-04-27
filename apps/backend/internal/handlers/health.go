package handlers

import (
	"net/http"

	"github.com/rumbea/backend/internal/httpx"
)

type HealthHandler struct {
	HasDB   bool
	HasAuth bool
	Version string
}

func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]interface{}{
		"status":   "ok",
		"version":  h.Version,
		"has_db":   h.HasDB,
		"has_auth": h.HasAuth,
	})
}
