# Rumbea — Backend Go

API REST en Go para Rumbea. Valida JWTs emitidos por Supabase Auth y consulta Postgres (Supabase).

## Stack

- Go 1.22, chi, pgx/v5, golang-jwt/v5, godotenv
- Despliegue: Fly.io (región `gru` — São Paulo)

## Correr en local

```bash
cd apps/backend
cp .env.example .env
# Edita .env con tus claves
go mod tidy
go run ./cmd/server
```

Sin `DATABASE_URL`, arranca en **modo limitado** (solo `/health`). Útil para verificar que compila antes de tener Supabase.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP (default 8080; Fly.io lo setea solo) |
| `DATABASE_URL` | Connection string de Supabase Postgres (usa el **pooler** puerto 6543) |
| `SUPABASE_JWT_SECRET` | JWT secret del proyecto Supabase (Settings → API) |
| `SUPABASE_URL` | URL del proyecto (informativo) |
| `ENV` | `development` o `production` |
| `CORS_ALLOWED_ORIGINS` | Coma-separados. `*` en dev |

## Endpoints

### Públicos (opcionalmente autenticados)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Status del backend |
| `GET` | `/api/v1/establishments` | Listar/buscar con filtros (HU-01, HU-02) |
| `GET` | `/api/v1/establishments/{id}` | Detalle |
| `GET` | `/api/v1/establishments/{id}/links` | Enlaces públicos (HU-2.5 visible) |
| `GET` | `/api/v1/genres` | Catálogo de géneros musicales |

### Filtros de `GET /establishments` (HU-02)

- `q` — texto libre en nombre/dirección
- `category` — `discoteca | bar | cocteleria | lounge | pub | otro`
- `theme` — texto libre
- `genre_ids` — coma-separados (ej: `1,3`)
- `max_cover` — precio máximo del cover
- `has_capacity` — `true` / `false`
- `sort` — `recent | occupancy` (default alfabético)
- `limit`, `offset`

### Autenticados (requieren `Authorization: Bearer <jwt>`)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/establishments` | Crear establecimiento (HU-08) |
| `PATCH` | `/api/v1/establishments/{id}` | Editar |
| `PATCH` | `/api/v1/establishments/{id}/occupancy` | Actualizar aforo actual (RF11) |
| `DELETE` | `/api/v1/establishments/{id}` | Eliminar |
| `POST` | `/api/v1/establishments/{id}/links` | Agregar enlace (HU-2.5) |
| `DELETE` | `/api/v1/establishments/{id}/links/{linkId}` | Eliminar enlace (RF6) |
| `GET` | `/api/v1/favorites` | Listar mis favoritos (HU-10) |
| `POST` | `/api/v1/favorites/{id}` | Marcar como favorito (HU-09) |
| `DELETE` | `/api/v1/favorites/{id}` | Desmarcar (HU-09) |

## Despliegue a Fly.io

Requiere CLI: https://fly.io/docs/hands-on/install-flyctl/

```bash
cd apps/backend
fly auth login
fly launch --no-deploy   # detecta el Dockerfile y crea la app
# Cuando pregunte, confirma el nombre `rumbea-api` y la región `gru`

# Setea secrets (no se suben al repo)
fly secrets set \
  DATABASE_URL="postgresql://postgres....pooler.supabase.com:6543/postgres" \
  SUPABASE_JWT_SECRET="..." \
  SUPABASE_URL="https://xxxx.supabase.co" \
  CORS_ALLOWED_ORIGINS="*"

fly deploy
```

La URL queda como `https://rumbea-api.fly.dev`.

## Estructura

```
apps/backend/
├── cmd/server/main.go       entry point
├── internal/
│   ├── config/              carga env
│   ├── db/                  pool pgx
│   ├── httpx/               helpers JSON
│   ├── middleware/          auth JWT Supabase
│   ├── models/              DTOs
│   ├── repository/          queries Postgres
│   └── handlers/            HTTP handlers
├── Dockerfile
├── fly.toml
├── .env.example
└── go.mod
```
