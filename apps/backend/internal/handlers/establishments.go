package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/rumbea/backend/internal/httpx"
	"github.com/rumbea/backend/internal/middleware"
	"github.com/rumbea/backend/internal/models"
	"github.com/rumbea/backend/internal/repository"
)

type EstablishmentHandler struct {
	Repo *repository.EstablishmentRepo
}

func NewEstablishmentHandler(repo *repository.EstablishmentRepo) *EstablishmentHandler {
	return &EstablishmentHandler{Repo: repo}
}

func (h *EstablishmentHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := models.SearchFilters{
		Query:    q.Get("q"),
		Category: q.Get("category"),
		Theme:    q.Get("theme"),
		SortBy:   q.Get("sort"),
	}
	if v := q.Get("max_cover"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.MaxCover = &n
		}
	}
	if v := q.Get("has_capacity"); v != "" {
		b := v == "true" || v == "1"
		f.HasCapacity = &b
	}
	if v := q.Get("genre_ids"); v != "" {
		for _, part := range strings.Split(v, ",") {
			if n, err := strconv.Atoi(strings.TrimSpace(part)); err == nil {
				f.GenreIDs = append(f.GenreIDs, n)
			}
		}
	}
	if v := q.Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.Limit = n
		}
	}
	if v := q.Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.Offset = n
		}
	}

	items, err := h.Repo.Search(r.Context(), f)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *EstablishmentHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	e, err := h.Repo.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.Error(w, http.StatusNotFound, "establishment not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, e)
}

func (h *EstablishmentHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}

	var in models.CreateEstablishmentInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if in.Name == "" || in.Address == "" || in.Category == "" || in.MaxCapacity <= 0 {
		httpx.Error(w, http.StatusBadRequest, "name, address, category, max_capacity son obligatorios")
		return
	}

	e, err := h.Repo.Create(r.Context(), userID, in)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, e)
}

func (h *EstablishmentHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	id := chi.URLParam(r, "id")

	var in models.UpdateEstablishmentInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	e, err := h.Repo.Update(r.Context(), id, userID, in)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.Error(w, http.StatusNotFound, "establishment not found or not owned")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, e)
}

func (h *EstablishmentHandler) UpdateOccupancy(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	id := chi.URLParam(r, "id")

	var in models.OccupancyInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.Repo.UpdateOccupancy(r.Context(), id, userID, in.CurrentOccupancy); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.Error(w, http.StatusNotFound, "establishment not found or invalid occupancy")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "updated"})
}

func (h *EstablishmentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	id := chi.URLParam(r, "id")
	if err := h.Repo.Delete(r.Context(), id, userID); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.Error(w, http.StatusNotFound, "establishment not found or not owned")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *EstablishmentHandler) ListGenres(w http.ResponseWriter, r *http.Request) {
	items, err := h.Repo.ListGenres(r.Context())
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}
