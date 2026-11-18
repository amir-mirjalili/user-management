# User Management System

This project is a complete implementation of a technical assessment task for a Software Engineering position, consisting of two main parts: a **Frontend** (developed with Next.js and TypeScript) and a **Backend** (developed with Golang and PostgreSQL).

---

## Table of Contents

1. [How to Run](#1-how-to-run)
2. [Tech Stack & Libraries](#2-tech-stack--libraries)
3. [Project Architecture](#3-project-architecture)
4. [State Management](#4-state-management)
5. [API Request Management](#5-api-request-management)
6. [Key Architectural & Implementation Decisions](#6-key-architectural--implementation-decisions)
7. [API Documentation](#7-api-documentation)

---

## 1. How to Run

### Method 1: Quick Run with Docker Compose (Recommended)

With Docker installed on your system, launch the entire ecosystem (PostgreSQL database, Go backend server, and Next.js client) with a single command:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- The database is automatically migrated and seeded with 47 initial sample users (including `Amin Tasharofi`).

---

### Method 2: Manual Local Development

#### Prerequisites:
- Node.js (v18 or higher)
- Golang (v1.22 or higher)
- Running PostgreSQL database instance

#### Step 1: Database & Backend Setup (Golang)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Edit the `.env` file if necessary (default values are preconfigured for local Postgres):
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=users_db
   DB_SSLMODE=disable
   ```
3. Create the database in PostgreSQL:
   ```bash
   psql -U postgres -c "CREATE DATABASE users_db;"
   ```
4. Run the backend server (migrations and seed data will run automatically on startup):
   ```bash
   go run cmd/server/main.go
   ```

Backend unit tests can be executed with:
```bash
go test -v ./...
```

#### Step 2: Frontend Setup (Next.js)

1. In a separate terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 2. Tech Stack & Libraries

### Frontend:
- **Next.js (App Router):** Modern React framework offering optimal performance, server/client component boundaries, and efficient rendering.
- **TypeScript:** Strong static typing for models, API params, and server responses to eliminate runtime errors.
- **Tailwind CSS:** Responsive, modern UI styling with clean transitions and animations.
- **Lucide React:** Standard, lightweight icon set for clean and intuitive visual hierarchy.

### Backend:
- **Golang (Go 1.22+):** High-performance, statically typed language with low memory footprint and excellent concurrency handling.
- **Chi Router (`github.com/go-chi/chi/v5`):** Lightweight, idiomatic router compatible with standard `net/http`, featuring subrouting and middleware support.
- **Chi CORS (`github.com/go-chi/cors`):** Middleware for managing CORS headers and frontend access control.
- **PostgreSQL + `github.com/lib/pq`:** Robust relational database with connection pooling and secure transactions.

---

## 3. Project Architecture

The project follows standard software engineering principles and layered architecture:

```
user-management/
├── backend/                       # Go Backend Service
│   ├── cmd/
│   │   └── server/
│   │       └── main.go            # Server entrypoint, DB connection, and graceful shutdown
│   ├── internal/
│   │   ├── config/                # Environment variable loader with defaults
│   │   ├── database/              # DB connection pooling, auto-migration, and initial seeder (47 users)
│   │   ├── handler/               # HTTP transport layer (controllers, query parsing, response formatting)
│   │   ├── model/                 # Data structures (User, Pagination, Responses)
│   │   ├── repository/            # Database access layer with optimized SQL queries
│   │   └── service/               # Business logic layer and input validation
│   ├── Dockerfile
│   └── go.mod
│
├── frontend/                      # Next.js & TypeScript Admin Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Global layout with RTL support and theme styling
│   │   │   ├── page.tsx           # Main dashboard page composing all components
│   │   │   └── globals.css        # Global CSS variables and styling
│   │   ├── components/
│   │   │   ├── ui/                # Base UI components (Button, Badge, Modal, Skeleton, Toast)
│   │   │   └── users/             # User management components:
│   │   │       ├── UserTable.tsx         # User table handling various UI states
│   │   │       ├── UserPagination.tsx    # Server-side pagination and page size selector
│   │   │       ├── UserSearchBar.tsx     # Debounced name/email search with quick clear
│   │   │       ├── UserDetailModal.tsx   # Detailed user modal fetched independently
│   │   │       └── UserStatusToggle.tsx  # User status toggle with dedicated loading indicator
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts     # Debounce hook to prevent excessive API requests
│   │   │   ├── useUsers.ts        # Manages user list state, pagination, and status updates
│   │   │   └── useUserDetail.ts   # Hook for fetching standalone user details by ID
│   │   ├── lib/
│   │   │   └── api-client.ts      # Modular Fetch client with standard error handling
│   │   ├── services/
│   │   │   └── userService.ts     # API service methods for user endpoints
│   │   └── types/
│   │       └── user.ts            # TypeScript type definitions
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml             # Full orchestration for Postgres + Backend + Frontend
└── README.md
```

---

## 4. State Management

This project uses **Custom React Hooks** alongside localized state (`useUsers` and `useUserDetail`):

1. **Separation of Concerns:**
   - The `useUsers` hook encapsulates all state related to the user table (current page, limit per page, search input query, debounced search query, users list, total records count, loading flags, and error state).
   - Components act strictly as presentation layers without embedding any data-fetching or business logic.

2. **Search and Filter Handling:**
   - As the user types in the search bar, the `useDebounce` hook introduces a 400ms delay, preventing an API call on every keystroke.
   - When the search term changes, the current page automatically resets to page 1 to display correct filtered results.

3. **Optimized Status Updates (Immediate Local Sync & Granular Loading):**
   - When toggling a user's status, an `updatingUserId` state tracks the specific user being updated, displaying a spinner only on that specific toggle button rather than locking or refreshing the entire table.
   - Upon receiving a successful response from `PATCH /api/v1/users/:id/status`, the corresponding user in the client-side state is updated immediately, and a toast notification provides instant user feedback.

---

## 5. API Request Management

1. **Centralized HTTP Client (`api-client.ts`):**
   - Built on standard `fetch` with support for dynamic query parameters, default headers, and centralized server error extraction.
   - Configurable via `NEXT_PUBLIC_API_URL` for smooth switching between local and production environments.

2. **User Service Layer (`userService.ts`):**
   - All network interactions are encapsulated within pure, testable service functions:
     - `getUsers({ page, limit, search })`
     - `getUserById(id)`
     - `updateUserStatus(id, status)`

3. **Comprehensive UI States:**
   - **Loading State:** Displays sleek skeleton loaders matching the exact dimensions of table rows to eliminate layout shifts.
   - **Error State:** Captures network or server errors, displaying a user-friendly error message alongside a "Retry" button centered in the view.
   - **Empty State:** When no users exist in the database, displays a clean empty state graphic and welcoming message.
   - **No Search Results State:** When a search query matches no records, displays a clear message ("No users found matching '...'") with a button to reset the search filter.
   - **Success State:** Displays an interactive, responsive table with hover highlights, status badges, and action buttons.

---

## 6. Key Architectural & Implementation Decisions

1. **Clean Architecture in Go:**
   - Strict separation of Repository, Service, and Handler layers.
   - Dependencies are injected via interfaces, enabling comprehensive unit testing without requiring a live database connection (see `user_service_test.go`).

2. **Search Debouncing:**
   - Without debouncing, quickly typing a 5-character search term would trigger 5 concurrent requests. This causes unnecessary database load and can lead to race conditions where older query responses overwrite newer ones. A 400ms debounce ensures requests are only dispatched after the user finishes typing.

3. **100% Server-side Pagination:**
   - In real-world enterprise applications, client-side pagination over complete datasets does not scale. The Go backend utilizes optimized `LIMIT` and `OFFSET` SQL queries with indexed columns, returning paginated subsets in milliseconds.

4. **Independent User Details Endpoint (`GET /api/v1/users/:id`):**
   - In accordance with task requirements, user details are not merely copied from existing table rows. The database and single-user endpoint provide extended fields (phone number, role/job title, avatar URL, biography, and last update timestamp) fetched on demand when opening the modal.

5. **Right-to-Left (RTL) & Localization Consideration:**
   - The UI includes RTL layout support and Persian date formatting (`fa-IR`), while maintaining `dir="ltr"` for email addresses and phone numbers to ensure readability and formatting standards.

---

## 7. API Documentation

### 1. Get Users List (with Pagination & Search)
- **Method:** `GET`
- **Endpoint:** `/api/v1/users`
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `search`: Search term across name and email (optional)
- **Sample Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Amin Tasharofi",
      "email": "amin@example.com",
      "status": "active",
      "createdAt": "2026-11-17T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 47
}
```

---

### 2. Get User Details
- **Method:** `GET`
- **Endpoint:** `/api/v1/users/:id`
- **Sample Response (200 OK):**
```json
{
  "id": 1,
  "name": "Amin Tasharofi",
  "email": "amin@example.com",
  "status": "active",
  "role": "Frontend Engineer",
  "phoneNumber": "+98 912 111 2233",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=amin@example.com",
  "bio": "Frontend developer focused on React, Next.js and clean UI/UX.",
  "createdAt": "2026-11-16T10:00:00Z",
  "updatedAt": "2026-11-17T10:00:00Z"
}
```

---

### 3. Update User Status
- **Method:** `PATCH`
- **Endpoint:** `/api/v1/users/:id/status`
- **Request Body:**
```json
{
  "status": "inactive"
}
```
- **Sample Response (200 OK):**
```json
{
  "id": 1,
  "name": "Amin Tasharofi",
  "email": "amin@example.com",
  "status": "inactive",
  "role": "Frontend Engineer",
  "phoneNumber": "+98 912 111 2233",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=amin@example.com",
  "bio": "Frontend developer focused on React, Next.js and clean UI/UX.",
  "createdAt": "2026-11-16T10:00:00Z",
  "updatedAt": "2026-11-18T10:20:00Z"
}
```
