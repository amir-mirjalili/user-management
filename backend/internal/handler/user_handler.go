package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"user-management-backend/internal/model"
	"user-management-backend/internal/service"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Route("/api/v1/users", func(r chi.Router) {
		r.Get("/", h.ListUsers)
		r.Get("/{id}", h.GetUserByID)
		r.Patch("/{id}/status", h.UpdateUserStatus)
	})
}

func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	page := 1
	if pageStr := query.Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	limit := 10
	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	search := strings.TrimSpace(query.Get("search"))

	resp, err := h.userService.ListUsers(page, limit, search)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, model.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
		})
		return
	}

	respondJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		respondJSON(w, http.StatusBadRequest, model.ErrorResponse{
			Error:   "Bad Request",
			Message: "Invalid user ID provided",
		})
		return
	}

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			respondJSON(w, http.StatusNotFound, model.ErrorResponse{
				Error:   "Not Found",
				Message: "User not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, model.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
		})
		return
	}

	respondJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || id <= 0 {
		respondJSON(w, http.StatusBadRequest, model.ErrorResponse{
			Error:   "Bad Request",
			Message: "Invalid user ID provided",
		})
		return
	}

	var req model.UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, model.ErrorResponse{
			Error:   "Bad Request",
			Message: "Invalid request payload: JSON body required",
		})
		return
	}

	user, err := h.userService.UpdateUserStatus(id, req.Status)
	if err != nil {
		if errors.Is(err, service.ErrInvalidStatus) {
			respondJSON(w, http.StatusBadRequest, model.ErrorResponse{
				Error:   "Bad Request",
				Message: err.Error(),
			})
			return
		}
		if errors.Is(err, service.ErrUserNotFound) {
			respondJSON(w, http.StatusNotFound, model.ErrorResponse{
				Error:   "Not Found",
				Message: "User not found",
			})
			return
		}
		respondJSON(w, http.StatusInternalServerError, model.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
		})
		return
	}

	respondJSON(w, http.StatusOK, user)
}

func respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}
