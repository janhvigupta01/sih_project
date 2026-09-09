# =========================
# CLIENT BUILD STAGE
# =========================
FROM node:20-alpine AS build-client

WORKDIR /app/client

# Copy package files first for Docker caching
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Fix Vite executable permission
RUN chmod 755 node_modules/.bin/vite || true
RUN chmod 755 node_modules/vite/bin/vite.js || true

# Build React/Vite application
RUN npm run build


# =========================
# PRODUCTION STAGE
# =========================
FROM node:20-alpine AS production

WORKDIR /app

# Server dependencies
COPY server/package*.json ./server/

RUN cd server && npm install --omit=dev

# Server source
COPY server/ ./server/

# Built frontend
COPY --from=build-client /app/client/dist ./client/dist

# AI engine
COPY ai_engine/ ./ai_engine/

# Environment
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server/server.js"]