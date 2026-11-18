package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"user-management-backend/internal/model"
)

type UserRepository interface {
	List(page, limit int, search string) ([]model.UserListItem, int64, error)
	GetByID(id int64) (*model.User, error)
	UpdateStatus(id int64, status model.UserStatus) (*model.User, error)
}

type postgresUserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) List(page, limit int, search string) ([]model.UserListItem, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var countQuery strings.Builder
	var listQuery strings.Builder
	var args []interface{}
	argIndex := 1

	countQuery.WriteString("SELECT COUNT(*) FROM users")
	listQuery.WriteString("SELECT id, name, email, status, created_at FROM users")

	search = strings.TrimSpace(search)
	if search != "" {
		filter := fmt.Sprintf(" WHERE LOWER(name) LIKE $%d OR LOWER(email) LIKE $%d", argIndex, argIndex)
		countQuery.WriteString(filter)
		listQuery.WriteString(filter)
		args = append(args, "%"+strings.ToLower(search)+"%")
		argIndex++
	}

	var total int64
	err := r.db.QueryRow(countQuery.String(), args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	listQuery.WriteString(fmt.Sprintf(" ORDER BY id ASC LIMIT $%d OFFSET $%d", argIndex, argIndex+1))
	queryArgs := append(args, limit, offset)

	rows, err := r.db.Query(listQuery.String(), queryArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	users := make([]model.UserListItem, 0, limit)
	for rows.Next() {
		var u model.UserListItem
		var statusStr string
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &statusStr, &u.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("failed to scan user row: %w", err)
		}
		u.Status = model.UserStatus(statusStr)
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating user rows: %w", err)
	}

	return users, total, nil
}

func (r *postgresUserRepository) GetByID(id int64) (*model.User, error) {
	query := `
		SELECT id, name, email, status, role, phone_number, avatar_url, bio, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var u model.User
	var statusStr string
	err := r.db.QueryRow(query, id).Scan(
		&u.ID,
		&u.Name,
		&u.Email,
		&statusStr,
		&u.Role,
		&u.PhoneNumber,
		&u.AvatarURL,
		&u.Bio,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by id %d: %w", id, err)
	}
	u.Status = model.UserStatus(statusStr)

	return &u, nil
}

func (r *postgresUserRepository) UpdateStatus(id int64, status model.UserStatus) (*model.User, error) {
	query := `
		UPDATE users
		SET status = $1, updated_at = $2
		WHERE id = $3
		RETURNING id, name, email, status, role, phone_number, avatar_url, bio, created_at, updated_at
	`

	now := time.Now().UTC()
	var u model.User
	var statusStr string
	err := r.db.QueryRow(query, string(status), now, id).Scan(
		&u.ID,
		&u.Name,
		&u.Email,
		&statusStr,
		&u.Role,
		&u.PhoneNumber,
		&u.AvatarURL,
		&u.Bio,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to update user status: %w", err)
	}
	u.Status = model.UserStatus(statusStr)

	return &u, nil
}
