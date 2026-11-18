package service

import (
	"errors"
	"testing"
	"time"

	"user-management-backend/internal/model"
)

type mockUserRepository struct {
	users        []model.UserListItem
	userDetail   *model.User
	updateResult *model.User
	err          error
}

func (m *mockUserRepository) List(page, limit int, search string) ([]model.UserListItem, int64, error) {
	if m.err != nil {
		return nil, 0, m.err
	}
	return m.users, int64(len(m.users)), nil
}

func (m *mockUserRepository) GetByID(id int64) (*model.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.userDetail != nil && m.userDetail.ID == id {
		return m.userDetail, nil
	}
	return nil, nil
}

func (m *mockUserRepository) UpdateStatus(id int64, status model.UserStatus) (*model.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.updateResult != nil && m.updateResult.ID == id {
		m.updateResult.Status = status
		return m.updateResult, nil
	}
	return nil, nil
}

func TestUserService_ListUsers(t *testing.T) {
	mockRepo := &mockUserRepository{
		users: []model.UserListItem{
			{ID: 1, Name: "Amin Tasharofi", Email: "amin@example.com", Status: "active", CreatedAt: time.Now()},
		},
	}

	svc := NewUserService(mockRepo)

	res, err := svc.ListUsers(1, 10, "")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if len(res.Data) != 1 {
		t.Errorf("expected 1 user, got %d", len(res.Data))
	}

	if res.Total != 1 {
		t.Errorf("expected total 1, got %d", res.Total)
	}
}

func TestUserService_GetUserByID(t *testing.T) {
	mockRepo := &mockUserRepository{
		userDetail: &model.User{
			ID:     1,
			Name:   "Amin Tasharofi",
			Email:  "amin@example.com",
			Status: "active",
		},
	}

	svc := NewUserService(mockRepo)

	// Valid user
	user, err := svc.GetUserByID(1)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if user.Name != "Amin Tasharofi" {
		t.Errorf("expected 'Amin Tasharofi', got %s", user.Name)
	}

	// Invalid ID
	_, err = svc.GetUserByID(0)
	if !errors.Is(err, ErrInvalidID) {
		t.Errorf("expected ErrInvalidID, got: %v", err)
	}

	// Not found
	_, err = svc.GetUserByID(999)
	if !errors.Is(err, ErrUserNotFound) {
		t.Errorf("expected ErrUserNotFound, got: %v", err)
	}
}

func TestUserService_UpdateUserStatus(t *testing.T) {
	mockRepo := &mockUserRepository{
		updateResult: &model.User{
			ID:     1,
			Name:   "Amin Tasharofi",
			Email:  "amin@example.com",
			Status: "active",
		},
	}

	svc := NewUserService(mockRepo)

	// Valid update to inactive
	user, err := svc.UpdateUserStatus(1, model.StatusInactive)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if user.Status != model.StatusInactive {
		t.Errorf("expected status 'inactive', got %s", user.Status)
	}

	// Invalid status value
	_, err = svc.UpdateUserStatus(1, model.UserStatus("suspended"))
	if !errors.Is(err, ErrInvalidStatus) {
		t.Errorf("expected ErrInvalidStatus, got: %v", err)
	}
}
