# --- Build stage ---
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

# --- Runtime stage ---
FROM node:26-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

USER appuser

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
