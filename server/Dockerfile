# Imagen de la API (Express + Prisma).
# Construir SIEMPRE desde la raíz del repo (necesita shared/):
#   docker build -f server/Dockerfile .

FROM node:20-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY shared /app/shared
COPY server /app/server
RUN npx prisma generate && npm run build

FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/prisma ./prisma
COPY --from=build /app/server/package.json ./package.json
EXPOSE 3000
# Aplica migraciones pendientes y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server/src/index.js"]
