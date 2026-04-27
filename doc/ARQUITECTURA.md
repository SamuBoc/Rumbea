# Arquitectura de Rumbea

## Diagrama de alto nivel

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  React Native   │         │   Go backend     │         │   Supabase     │
│  (Expo)         │──JWT───▶│   (chi + pgx)    │──SQL───▶│   Postgres     │
│  Expo Go / APK  │         │   Fly.io (gru)   │         │   Auth         │
│                 │────── Supabase SDK ──────────────────▶│   Storage      │
└─────────────────┘                                      └────────────────┘
```

## Decisiones clave

### Auth
- **Supabase Auth** emite JWTs firmados (HS256 con `JWT_SECRET`).
- La app mobile usa `@supabase/supabase-js` para login/registro/sesión persistente.
- El backend Go **valida** los JWTs en su middleware — no emite tokens propios.
- Cuando un usuario se registra, un trigger en Supabase crea automáticamente su fila en `profiles` con el `role` (`client` | `establishment_owner`).

### Flujos de datos

1. **Operaciones simples** (listar favoritos, marcar favorito, leer perfil): la mobile puede hablar **directo con Supabase** usando RLS. No pasa por el backend.
2. **Operaciones complejas** (búsqueda con filtros agregados, actualizar aforo validando capacidad, futuras integraciones): van por el backend Go.
3. Tenemos **ambos caminos implementados** en `lib/data.ts` para flexibilidad. Hoy están usando el API Go; si se quiere migrar alguna operación a Supabase directo, se cambia en un solo archivo.

### Aforo en tiempo real (RF11)
- Implementado hoy como un `PATCH /establishments/:id/occupancy` que el owner llama manualmente o desde un futuro panel web.
- **Futuro**: usar Supabase Realtime (subscripción a cambios en `establishments`) para que la app del cliente vea el aforo actualizarse sin recargar.

### Storage (HU-08 foto del establecimiento)
- Bucket `establishment-photos` en Supabase Storage.
- Política: cada owner solo puede escribir en la subcarpeta con su UUID.
- La mobile sube con `expo-image-picker` → `supabase.storage.from('establishment-photos').upload(...)`.
- Si no hay foto, la app usa un placeholder.

### RLS (Row Level Security)
- Activo en todas las tablas.
- Los listados de establishments son públicos (`to anon, authenticated using (is_active = true)`).
- Solo el owner puede mutar sus establecimientos, enlaces y schedules.
- Solo el propio usuario ve/modifica sus favoritos.

## Por qué esta combinación

| Decisión | Motivo |
|---|---|
| Supabase Auth vs auth propio en Go | Ahorra 3-5 días. El SDK en RN hace todo. |
| Go backend aunque Supabase podría servir directo | Valor agregado: lógica compleja (aforo, búsquedas, integraciones). Aprendizaje del curso. |
| Monorepo | 6 personas trabajando, facilita PRs cruzados y que el Config Manager tenga todo en un lugar. |
| Expo + Expo Go para dev | Cada miembro del equipo prueba la app en su celular en 30s. Sin stores, sin builds. |
| EAS Build para entrega | Genera APK real firmado, simulando entrega a cliente. |
| Fly.io `gru` | 30ms desde Cali, free tier, no se duerme. |

## No incluido hoy (futuras HUs)

- Reseñas (RF3) — tabla `reviews` ya creada, falta UI y endpoint
- Eventos premium (RF4)
- Plan premium de establecimiento (RF12)
- Realtime de aforo (mejora de RF11)
- Upload de fotos desde la app (ahora solo URL manual)
- Recuperación de contraseña
- Notificaciones push
