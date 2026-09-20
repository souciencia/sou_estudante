# Estágio 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o bulker ./cmd/bulker

# Estágio 2: Runtime (Final)
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/bulker .
ENTRYPOINT ["./bulker"]
