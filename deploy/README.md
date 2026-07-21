# Despliegue en VPS — torneo.shona.lat

Stack de producción con Docker Compose: PostgreSQL + API (Express/Prisma) +
Caddy (sirve el frontend compilado y hace proxy de `/api`).

Hay dos variantes según cómo se administre el VPS:

- **Con Dokploy** (nuestro caso) → `docker-compose.dokploy.yml`; el Traefik de
  Dokploy maneja el dominio y el HTTPS.
- **VPS "pelado"** (sin panel) → `docker-compose.prod.yml`; Caddy toma los
  puertos 80/443 y emite el certificado él mismo.

## Opción A — Dokploy (recomendada)

Requisito: el repo debe estar en GitHub/GitLab (Dokploy clona y construye desde ahí)
y el DNS `torneo.shona.lat` → IP del VPS (ya está).

1. En Dokploy: **Create Project** → **Add Service → Compose** (tipo Docker Compose)
2. Conectar el repositorio y la rama `main`; en **Compose Path** poner
   `./docker-compose.dokploy.yml`
3. En la pestaña **Environment**, pegar las variables (mismos nombres que
   `.env.production.example`) con claves fuertes:

   ```env
   POSTGRES_USER=torneo
   POSTGRES_PASSWORD=...
   POSTGRES_DB=torneo
   JWT_SECRET=...
   ADMIN_EMAIL=admin@torneo.com
   ADMIN_PASSWORD=...
   ```

4. **Deploy** y esperar a que construya las 3 imágenes
5. En la pestaña **Domains** del servicio: **Add Domain** →
   Host `torneo.shona.lat`, **Service** `web`, **Port** `80`, HTTPS activado
   (certificado Let's Encrypt automático)
6. Crear el admin (una sola vez): abrir la **Terminal** del contenedor `api`
   en Dokploy y ejecutar:

   ```sh
   node dist/server/prisma/seed.js
   ```

Para actualizar: push a `main` y **Redeploy** en Dokploy (o activar auto-deploy
con el webhook que ofrece Dokploy).

## Opción B — VPS sin panel

## Requisitos previos

- VPS con Docker y Docker Compose instalados (`curl -fsSL https://get.docker.com | sh`)
- Registro DNS tipo **A**: `torneo.shona.lat` → IP del VPS (ya configurado)
- Puertos **80** y **443** abiertos en el firewall del VPS

## Pasos

```bash
# 1. Clonar el repo en el VPS
git clone <url-del-repo> torneo && cd torneo

# 2. Crear el .env de producción y editar TODOS los valores
cp .env.production.example .env
nano .env   # claves fuertes para Postgres, JWT_SECRET y ADMIN_PASSWORD

# 3. Construir y levantar todo (la API aplica las migraciones sola al arrancar)
docker compose -f docker-compose.prod.yml up -d --build

# 4. Crear el usuario admin (una sola vez; usa ADMIN_EMAIL/ADMIN_PASSWORD del .env)
docker compose -f docker-compose.prod.yml exec api node dist/server/prisma/seed.js
```

Listo: https://torneo.shona.lat (Caddy emite el certificado en el primer arranque;
puede tardar ~1 minuto).

## Operación

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f api

# Actualizar tras un git pull
docker compose -f docker-compose.prod.yml up -d --build

# Cambiar la contraseña del admin: editar ADMIN_PASSWORD en .env y re-ejecutar
docker compose -f docker-compose.prod.yml up -d api
docker compose -f docker-compose.prod.yml exec api node dist/server/prisma/seed.js

# Backup de la base de datos
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U torneo torneo > backup.sql
```

## Notas de seguridad

- El puerto 5432 de Postgres **no** está expuesto al exterior (solo red interna
  de Docker).
- Los datos viven en el volumen `pgdata`; sobreviven a `docker compose down`
  (se pierden solo con `down -v`).
- Nunca subir el `.env` al repositorio.
