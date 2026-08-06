# Estágio 1: Instalação de dependências
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Estágio 2: Build do projeto
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Desabilita telemetria do Next durante o build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Estágio 3: Runner (Imagem final)
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copia apenas os arquivos necessários do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"] 

