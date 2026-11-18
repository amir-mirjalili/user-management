# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Dependencies
COPY go.mod go.sum ./
RUN go mod download

# Source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Final production stage
FROM alpine:3.19

WORKDIR /app

# Copy SSL certificates from builder (no apk network call needed)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
