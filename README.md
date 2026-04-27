# Rumbea

Buscador de lugares de entretenimiento nocturno en Cali (discotecas, bares, coctelerías) con control de aforo en tiempo real, filtros, reseñas y perfiles de establecimiento.

Proyecto académico — Gerencia de Proyectos T.I, Universidad Icesi.

## Estructura

```
Rumbea/
├── apps/
│   ├── backend/     Go + chi + pgx (API REST)
│   └── mobile/      React Native + Expo + TypeScript
├── supabase/        Migrations SQL, RLS, seed data
└── doc/             Documentación del proyecto
```

## Stack

- **Mobile:** React Native + Expo SDK 52 + TypeScript + expo-router
- **Backend:** Go 1.22 + chi + pgx
- **BD + Auth + Storage:** Supabase (Postgres + Auth + Storage)
- **Deploy backend:** Fly.io (región São Paulo)
- **Build móvil:** EAS Build para APK/IPA

## Arrancar local

Ver `apps/backend/README.md` y `apps/mobile/README.md`.

## Equipo

- Albert Valencia Escobar — Team Leader
- Stevan Andrade Becerra — Configuration Manager
- Juan David Soriano Ortiz — Planning Manager
- Juan Pablo Martínez — Quality Manager
- Jhoan Manuel Tovar Rendón — Test Manager
- Samuel Andres Bonilla Cortazar — Development Manager
