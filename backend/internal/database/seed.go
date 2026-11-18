package database

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"
)

type seedUser struct {
	Name        string
	Email       string
	Status      string
	Role        string
	PhoneNumber string
	Bio         string
	DaysAgo     int
}

func Seed(db *sql.DB) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check existing user count: %w", err)
	}

	if count > 0 {
		log.Printf("Database already contains %d users. Skipping seed.", count)
		return nil
	}

	log.Println("Seeding initial 47 users...")

	users := []seedUser{
		{
			Name:        "Amin Tasharofi",
			Email:       "amin@example.com",
			Status:      "active",
			Role:        "Frontend Engineer",
			PhoneNumber: "+98 912 111 2233",
			Bio:         "Frontend developer focused on React, Next.js and clean UI/UX.",
			DaysAgo:     1,
		},
		{
			Name:        "Sara Mohammadi",
			Email:       "sara.mohammadi@example.com",
			Status:      "active",
			Role:        "Product Designer",
			PhoneNumber: "+98 912 222 3344",
			Bio:         "UI/UX enthusiast crafting human-centered digital experiences.",
			DaysAgo:     3,
		},
		{
			Name:        "Ali Rezaei",
			Email:       "ali.rezaei@example.com",
			Status:      "inactive",
			Role:        "Backend Developer",
			PhoneNumber: "+98 912 333 4455",
			Bio:         "Golang and distributed systems engineer.",
			DaysAgo:     5,
		},
		{
			Name:        "Fatemeh Karimi",
			Email:       "fatemeh.karimi@example.com",
			Status:      "active",
			Role:        "Engineering Manager",
			PhoneNumber: "+98 912 444 5566",
			Bio:         "Technical leader with 8+ years experience scaling engineering teams.",
			DaysAgo:     8,
		},
		{
			Name:        "Reza Hosseini",
			Email:       "reza.h@example.com",
			Status:      "inactive",
			Role:        "DevOps Engineer",
			PhoneNumber: "+98 912 555 6677",
			Bio:         "Kubernetes, CI/CD pipelines, and cloud infrastructure.",
			DaysAgo:     10,
		},
		{
			Name:        "Zahra Ahmadi",
			Email:       "zahra.ahmadi@example.com",
			Status:      "active",
			Role:        "QA Engineer",
			PhoneNumber: "+98 912 666 7788",
			Bio:         "Automated testing and quality assurance specialist.",
			DaysAgo:     12,
		},
		{
			Name:        "Mehdi Ghasemi",
			Email:       "mehdi.gh@example.com",
			Status:      "active",
			Role:        "Full Stack Developer",
			PhoneNumber: "+98 912 777 8899",
			Bio:         "TypeScript, Next.js, Go and Postgres architect.",
			DaysAgo:     14,
		},
		{
			Name:        "Neda Ebrahimi",
			Email:       "neda.ebrahimi@example.com",
			Status:      "inactive",
			Role:        "Product Manager",
			PhoneNumber: "+98 912 888 9900",
			Bio:         "Data-driven product strategy and roadmap execution.",
			DaysAgo:     16,
		},
		{
			Name:        "Hossein Moradi",
			Email:       "hossein.m@example.com",
			Status:      "active",
			Role:        "Security Specialist",
			PhoneNumber: "+98 912 999 0011",
			Bio:         "Application security, penetration testing and compliance.",
			DaysAgo:     18,
		},
		{
			Name:        "Maryam Sadeghi",
			Email:       "maryam.s@example.com",
			Status:      "active",
			Role:        "Data Analyst",
			PhoneNumber: "+98 912 000 1122",
			Bio:         "Transforming complex data into actionable business insights.",
			DaysAgo:     20,
		},
	}

	// First names & last names pool to reach 47 users
	firstNames := []string{"Amir", "Saeed", "Mona", "Kaveh", "Shayan", "Pouya", "Elham", "Parisa", "Babak", "Farhad", "Roya", "Nima", "Arash", "Sanaz", "Navid", "Shirin", "Saman", "Yasaman", "Arman"}
	lastNames := []string{"Tehrani", "Soleimani", "Mirzaei", "Fallah", "Abbasi", "Rostami", "Salimi", "Ranjbar", "Mohebbi", "Kazemi", "Jafari", "Khosravi", "Haghighi", "Sharifi", "Rahimi", "Yousefi"}
	roles := []string{"Frontend Developer", "Backend Developer", "DevOps Engineer", "UI Designer", "Product Owner", "Data Engineer", "Mobile Developer", "Scrum Master"}

	r := rand.New(rand.NewSource(42)) // deterministic seed

	for len(users) < 47 {
		fn := firstNames[r.Intn(len(firstNames))]
		ln := lastNames[r.Intn(len(lastNames))]
		name := fmt.Sprintf("%s %s", fn, ln)
		email := fmt.Sprintf("%s.%s%d@example.com", fn, ln, len(users)+1)
		status := "active"
		if r.Float32() < 0.25 {
			status = "inactive"
		}
		role := roles[r.Intn(len(roles))]
		phone := fmt.Sprintf("+98 912 %03d %04d", r.Intn(900)+100, r.Intn(9000)+1000)
		bio := fmt.Sprintf("%s professional with passion for software craft.", role)
		daysAgo := 20 + len(users)*3

		users = append(users, seedUser{
			Name:        name,
			Email:       email,
			Status:      status,
			Role:        role,
			PhoneNumber: phone,
			Bio:         bio,
			DaysAgo:     daysAgo,
		})
	}

	baseTime := time.Date(2026, 11, 17, 10, 0, 0, 0, time.UTC)

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO users (name, email, status, role, phone_number, avatar_url, bio, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for i, u := range users {
		createdAt := baseTime.Add(-time.Duration(u.DaysAgo) * 24 * time.Hour)
		avatarURL := fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", u.Email)
		_, err := stmt.Exec(u.Name, u.Email, u.Status, u.Role, u.PhoneNumber, avatarURL, u.Bio, createdAt, createdAt)
		if err != nil {
			return fmt.Errorf("failed to insert user #%d (%s): %w", i+1, u.Name, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit seed transaction: %w", err)
	}

	log.Printf("Successfully seeded %d users into PostgreSQL.", len(users))
	return nil
}
