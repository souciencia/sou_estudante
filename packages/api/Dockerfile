# Estágio 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY api/go.mod api/go.sum ./api/
COPY shared/go.mod ./shared/
RUN cd api && go mod download
COPY shared ./shared
COPY api ./api
RUN cd api && go mod tidy
RUN cd api && CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/api


# Estágio 2: Runtime (Final)
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
