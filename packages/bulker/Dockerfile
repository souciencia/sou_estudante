# Estágio 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY bulker/go.mod bulker/go.sum ./bulker/
COPY shared/go.mod ./shared/
RUN cd bulker && go mod download
COPY shared ./shared
COPY bulker ./bulker
RUN cd bulker && go mod tidy
RUN cd bulker && CGO_ENABLED=0 GOOS=linux go build -o /app/bin/bulker ./src

# Estágio 2: Runtime (Final)
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/bin/bulker .
COPY bulker/src/mapping.json ./
CMD ["./bulker"]
