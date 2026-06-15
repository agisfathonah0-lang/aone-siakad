# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build both
RUN cd backend && npm run build
RUN cd frontend && npm run build

# Copy migration SQL files (tsc does not copy non-TS files)
RUN cp -r backend/src/database/migrations backend/dist/database/migrations

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app

# PostgreSQL client for optional DB admin tasks
RUN apk add --no-cache postgresql-client

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "backend/dist/index.js"]
