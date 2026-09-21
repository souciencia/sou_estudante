# Estágio 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o main ./cmd/api

# Estágio 2: Runtime (Final)
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata \
    && adduser -D -u 10001 appuser
USER appuser
WORKDIR /home/appuser
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
