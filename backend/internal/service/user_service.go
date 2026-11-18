package service

import (
	"errors"
	"fmt"

	"user-management-backend/internal/model"
	"user-management-backend/internal/repository"
)

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrInvalidStatus = errors.New("invalid status value: must be 'active' or 'inactive'")
	ErrInvalidID     = errors.New("invalid user ID")
)

type UserService interface {
	ListUsers(page, limit int, search string) (*model.ListUsersResponse, error)
	GetUserByID(id int64) (*model.User, error)
	UpdateUserStatus(id int64, status model.UserStatus) (*model.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) ListUsers(page, limit int, search string) (*model.ListUsersResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	users, total, err := s.repo.List(page, limit, search)
	if err != nil {
		return nil, fmt.Errorf("service failed to list users: %w", err)
	}

	// Always return empty slice instead of null in JSON
	if users == nil {
		users = []model.UserListItem{}
	}

	return &model.ListUsersResponse{
		Data:  users,
		Page:  page,
		Limit: limit,
		Total: total,
	}, nil
}

func (s *userService) GetUserByID(id int64) (*model.User, error) {
	if id <= 0 {
		return nil, ErrInvalidID
	}

	user, err := s.repo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("service failed to get user: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}

func (s *userService) UpdateUserStatus(id int64, status model.UserStatus) (*model.User, error) {
	if id <= 0 {
		return nil, ErrInvalidID
	}

	if status != model.StatusActive && status != model.StatusInactive {
		return nil, ErrInvalidStatus
	}

	user, err := s.repo.UpdateStatus(id, status)
	if err != nil {
		return nil, fmt.Errorf("service failed to update status: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}
