package model

import "time"

// UserStatus represents user account status
type UserStatus string

const (
	StatusActive   UserStatus = "active"
	StatusInactive UserStatus = "inactive"
)

// User represents the full user entity
type User struct {
	ID          int64      `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	Status      UserStatus `json:"status"`
	Role        string     `json:"role"`
	PhoneNumber string     `json:"phoneNumber"`
	AvatarURL   string     `json:"avatarUrl"`
	Bio         string     `json:"bio"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

// UserListItem is the concise user representation in the list API
type UserListItem struct {
	ID        int64      `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Status    UserStatus `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
}

// ListUsersResponse represents the paginated response for users list
type ListUsersResponse struct {
	Data  []UserListItem `json:"data"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
	Total int64          `json:"total"`
}

// UpdateStatusRequest represents payload for changing user status
type UpdateStatusRequest struct {
	Status UserStatus `json:"status"`
}

// ErrorResponse represents standard error payload
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
