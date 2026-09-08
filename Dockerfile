# Multi-Stage Dockerfile for Scrap Sathi SIH 2026 Production Deployment
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/
COPY --from=build-client /app/client/dist ./client/dist
COPY ai_engine/ ./ai_engine/

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000
CMD ["node", "server/server.js"]
