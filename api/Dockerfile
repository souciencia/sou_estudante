# Estágio 1: Build
FROM docker.io/library/golang:1.27-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o main ./cmd/api

# Estágio 2: Runtime (Final)
FROM docker.io/library/alpine:3.20
RUN apk add --no-cache ca-certificates tzdata \
    && adduser -D -u 10001 appuser
USER appuser
WORKDIR /home/appuser
COPY --from=builder /app/main .
EXPOSE 8080
# /healthz é só liveness (não consulta o Elasticsearch). 127.0.0.1 evita ::1.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-8080}/healthz" || exit 1
CMD ["./main"]
