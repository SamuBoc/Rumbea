# Supabase — Rumbea

## Cómo aplicar estas migraciones

### Opción A — Dashboard de Supabase (rápido)

1. Entra a tu proyecto en https://supabase.com/dashboard
2. Ve a **SQL Editor**
3. Ejecuta en este orden:
   - `migrations/0001_initial_schema.sql`
   - `migrations/0002_rls_policies.sql`
   - `migrations/0003_storage.sql`
   - `seed.sql`

### Opción B — Supabase CLI (recomendado a mediano plazo)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

## Estructura

- `migrations/0001_initial_schema.sql` — tablas, tipos, triggers
- `migrations/0002_rls_policies.sql` — Row Level Security
- `migrations/0003_storage.sql` — bucket de fotos
- `seed.sql` — datos iniciales (géneros musicales)

## Modelo de datos (resumen)

```
auth.users (Supabase Auth)
    ↓ 1:1 (trigger automático)
profiles (id, full_name, role: 'client' | 'establishment_owner')

establishments (owner_id → profiles)
    ├── establishment_genres ← musical_genres
    ├── establishment_schedules
    ├── establishment_links  (HU-2.5)
    └── reviews

favorites (user_id, establishment_id)  ← HU-09, HU-10
```

## Credenciales que te interesan del proyecto Supabase

Al crear el proyecto, anota:
- **Project URL:** `https://xxxxx.supabase.co`
- **anon key:** se usa en la app mobile
- **service_role key:** NUNCA en la app, solo en el backend Go si se necesita
- **JWT secret:** el backend Go lo usa para validar tokens
- **DB connection string:** para el backend Go (`postgresql://postgres.xxx:...@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`)
