package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/rumbea/backend/internal/httpx"
	"github.com/rumbea/backend/internal/middleware"
	"github.com/rumbea/backend/internal/repository"
)

type FavoriteHandler struct {
	Repo *repository.FavoriteRepo
}

func NewFavoriteHandler(repo *repository.FavoriteRepo) *FavoriteHandler {
	return &FavoriteHandler{Repo: repo}
}

func (h *FavoriteHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	items, err := h.Repo.ListByUser(r.Context(), userID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *FavoriteHandler) Add(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	estID := chi.URLParam(r, "id")
	if err := h.Repo.Add(r.Context(), userID, estID); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"is_favorite": true})
}

func (h *FavoriteHandler) Remove(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	estID := chi.URLParam(r, "id")
	if err := h.Repo.Remove(r.Context(), userID, estID); err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"is_favorite": false})
}
