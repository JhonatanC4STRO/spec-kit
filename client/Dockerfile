# Imagen del frontend: compila React y lo sirve con Caddy.
# Construir SIEMPRE desde la raíz del repo (necesita shared/ y deploy/):
#   docker build -f client/Dockerfile .
#
# CADDYFILE permite elegir la config según el entorno:
#   deploy/Caddyfile         → VPS "pelado" (Caddy maneja dominio + HTTPS)
#   deploy/Caddyfile.dokploy → Dokploy (Traefik maneja dominio + HTTPS)
ARG CADDYFILE=deploy/Caddyfile

FROM node:20-slim AS build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY shared /app/shared
COPY client /app/client
RUN npm run build

FROM caddy:2-alpine
ARG CADDYFILE
COPY ${CADDYFILE} /etc/caddy/Caddyfile
COPY --from=build /app/client/dist /srv
