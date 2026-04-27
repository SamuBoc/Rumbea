package handlers

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/rumbea/backend/internal/httpx"
	"github.com/rumbea/backend/internal/middleware"
	"github.com/rumbea/backend/internal/models"
	"github.com/rumbea/backend/internal/repository"
)

type LinkHandler struct {
	Repo *repository.LinkRepo
}

func NewLinkHandler(repo *repository.LinkRepo) *LinkHandler {
	return &LinkHandler{Repo: repo}
}

func (h *LinkHandler) List(w http.ResponseWriter, r *http.Request) {
	estID := chi.URLParam(r, "id")
	items, err := h.Repo.ListByEstablishment(r.Context(), estID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *LinkHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	estID := chi.URLParam(r, "id")

	ok, err := h.Repo.VerifyOwner(r.Context(), estID, userID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !ok {
		httpx.Error(w, http.StatusForbidden, "not the owner of this establishment")
		return
	}

	var in models.CreateLinkInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	in.Label = strings.TrimSpace(in.Label)
	in.URL = strings.TrimSpace(in.URL)
	if in.Label == "" || in.URL == "" {
		httpx.Error(w, http.StatusBadRequest, "label y url son obligatorios")
		return
	}
	if _, err := url.ParseRequestURI(in.URL); err != nil {
		httpx.Error(w, http.StatusBadRequest, "url inválida")
		return
	}

	l, err := h.Repo.Create(r.Context(), estID, in.Label, in.URL)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httpx.JSON(w, http.StatusCreated, l)
}

func (h *LinkHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserID(r.Context())
	if userID == "" {
		httpx.Error(w, http.StatusUnauthorized, "auth required")
		return
	}
	linkID := chi.URLParam(r, "linkId")
	if err := h.Repo.Delete(r.Context(), linkID, userID); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			httpx.Error(w, http.StatusNotFound, "link not found or not owned")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
