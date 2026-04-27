# Conectar todo — guía paso a paso

Esta guía es para cuando tengas las cuentas creadas y quieras pasar del modo demo a todo conectado (Supabase + Fly.io + app real).

## Checklist de cuentas

- [ ] **Supabase**: crea proyecto en https://supabase.com/dashboard
  - Región sugerida: `South America (São Paulo)`
  - Guarda la contraseña del DB (solo se muestra una vez)
- [ ] **Fly.io**: instala CLI (`iwr https://fly.io/install.ps1 -useb | iex` en PowerShell) y `fly auth signup`
- [ ] **Expo/EAS**: crea cuenta en https://expo.dev y `npm install -g eas-cli && eas login`

## 1. Supabase — aplicar schema

1. En el dashboard del proyecto Supabase → **SQL Editor**
2. Ejecuta en orden (copiar/pegar el contenido):
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_storage.sql`
   - `supabase/seed.sql`
3. Verifica en **Table Editor** que existan: `profiles`, `establishments`, `favorites`, `establishment_links`, `musical_genres`, etc.

### Obtener las claves

En **Project Settings → API**:
- `Project URL` → será `EXPO_PUBLIC_SUPABASE_URL` y `SUPABASE_URL`
- `anon public` key → será `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `JWT Secret` → será `SUPABASE_JWT_SECRET` (backend Go)

En **Project Settings → Database → Connection string → URI (pooler, Transaction mode)**:
- Esa cadena `postgresql://...pooler.supabase.com:6543/postgres` → será `DATABASE_URL`

## 2. Backend Go — correr local

```bash
cd apps/backend
cp .env.example .env
# Pega en .env:
#   DATABASE_URL=postgresql://postgres.xxxxx:...@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
#   SUPABASE_JWT_SECRET=...
#   SUPABASE_URL=https://xxxxx.supabase.co

go mod tidy        # descarga dependencias (primera vez)
go run ./cmd/server
```

Test rápido:
```
curl http://localhost:8080/health
```

## 3. Backend Go — desplegar a Fly.io

```bash
cd apps/backend
fly auth login

# Primera vez: crea la app
fly launch --no-deploy
# Cuando pregunte:
#   App name: rumbea-api (o lo que prefieras)
#   Region: gru (São Paulo)
#   Postgres: NO  (ya usamos Supabase)
#   Redis: NO
#   Deploy now: NO

# Setear secrets (NO los pongas en fly.toml)
fly secrets set \
  DATABASE_URL="postgresql://..." \
  SUPABASE_JWT_SECRET="..." \
  SUPABASE_URL="https://xxxxx.supabase.co" \
  CORS_ALLOWED_ORIGINS="*"

# Desplegar
fly deploy
```

Al terminar te da la URL: `https://rumbea-api.fly.dev`.

Test: `curl https://rumbea-api.fly.dev/health` → debe responder `{"status":"ok","has_db":true,"has_auth":true,...}`.

## 4. Mobile — apuntar a real

```bash
cd apps/mobile
cp .env.example .env
```

Edita `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_API_URL=https://rumbea-api.fly.dev
EXPO_PUBLIC_USE_MOCKS=false
```

Reinicia Expo:
```bash
npm install
npm start -- --clear
```

Escanea el QR con Expo Go y valida:
1. Registro de cliente (HU-07) — crea usuario en Supabase Auth + trigger crea profile
2. Registro de owner (HU-08) — marca el chip "Dueño de establecimiento"
3. Desde perfil de owner → crea establecimiento → aparece en listado de explorar
4. Marca favorito desde detalle → aparece en pestaña Favoritos

## 5. Build APK para el equipo

```bash
cd apps/mobile
eas build:configure    # solo primera vez
eas build --profile preview --platform android
```

Copia el link del `.apk` y compártelo. Cualquiera lo instala directo (Android necesita permitir "Instalar apps de fuentes desconocidas" la primera vez).

## Variables de entorno — resumen de dónde va qué

| Variable | Dónde | Valor |
|---|---|---|
| `DATABASE_URL` | `apps/backend/.env` y `fly secrets` | Pooler URI de Supabase |
| `SUPABASE_JWT_SECRET` | `apps/backend/.env` y `fly secrets` | JWT Secret del proyecto |
| `SUPABASE_URL` | `apps/backend/.env` y `fly secrets` | Project URL |
| `EXPO_PUBLIC_SUPABASE_URL` | `apps/mobile/.env` | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `apps/mobile/.env` | anon key |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env` | URL de Fly.io |
| `EXPO_PUBLIC_USE_MOCKS` | `apps/mobile/.env` | `false` al conectar |

## Problemas comunes

**"Invalid JWT" en el backend**
- El `SUPABASE_JWT_SECRET` del backend no coincide con el del proyecto. Ve a Settings → API → JWT Secret y copia otra vez.

**"relation profiles does not exist"**
- No corriste `0001_initial_schema.sql`. Repite el paso 1.

**Trigger `handle_new_user` no crea profile**
- Asegúrate de pasar `full_name` y `role` en `options.data` al llamar `signUp` (ya lo hace `lib/auth.tsx`).

**Fly.io pide tarjeta**
- Sí. En free tier no cobran, pero exigen tarjeta al crear cuenta. Si no puedes, usa Render (`render.com`) como alternativa — gratis y sin tarjeta, con el costo de que la API se duerme tras 15 min de inactividad.

**CORS error desde mobile**
- Setea `CORS_ALLOWED_ORIGINS=*` en los secrets de Fly para desarrollo. En producción restríngelo a tu dominio.

**Expo Go no carga la app**
- Asegúrate que tu celular y tu PC estén en la misma red WiFi, o usa el modo `tunnel`: `npx expo start --tunnel`.
