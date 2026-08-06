# Estágio 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY *.go ./
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o bulker .

# Estágio 2: Runtime (Final)
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/bulker .
CMD ["./bulker"]