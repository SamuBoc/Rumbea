# Rumbea — Mobile (React Native + Expo)

App móvil de Rumbea. Corre en Android, iOS y web (Expo Go para desarrollo, EAS Build para distribuir APK).

## Stack

- Expo SDK 52 + React Native 0.76 + TypeScript
- Navegación: `expo-router` (file-based routing)
- Estado auth: Context propio + Supabase SDK
- Storage local: AsyncStorage

## Correr en local

```bash
cd apps/mobile
cp .env.example .env
npm install
npm start
```

- Escanea el QR con **Expo Go** (Android/iOS) y la app se abre
- Con `EXPO_PUBLIC_USE_MOCKS=true` la app funciona completamente sin backend (datos locales)
- Al cambiar a `false`, usa Supabase Auth + el backend Go

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto |
| `EXPO_PUBLIC_API_URL` | URL del backend Go (Fly.io o `http://localhost:8080`) |
| `EXPO_PUBLIC_USE_MOCKS` | `true` para modo demo, `false` para conectar |

> Todas las env que la app necesita en runtime deben empezar por `EXPO_PUBLIC_` — es una restricción de Expo.

## Estructura

```
apps/mobile/
├── app/                        rutas (expo-router)
│   ├── _layout.tsx            root + AuthProvider
│   ├── index.tsx              redirige a login/tabs
│   ├── (auth)/
│   │   ├── login.tsx          HU-07 parte login
│   │   └── register.tsx       HU-07 + HU-08 (selector cliente/owner)
│   ├── (tabs)/
│   │   ├── index.tsx          Explorar — HU-02 filtros
│   │   ├── favorites.tsx      HU-10 historial favoritos
│   │   └── profile.tsx        Perfil + logout
│   └── establishment/
│       ├── [id].tsx           Detalle público (RF3, HU-09 toggle)
│       └── manage.tsx         Owner: HU-08 crear, HU-2.5 links, RF11 aforo
├── components/                 botones, inputs, chips, card
├── lib/
│   ├── env.ts                 env vars
│   ├── theme.ts               colores, spacing, fuentes
│   ├── supabase.ts            cliente Supabase
│   ├── api.ts                 fetch al backend Go con JWT
│   ├── auth.tsx               AuthProvider + mocks
│   ├── data.ts                capa de datos (mock ↔ real)
│   ├── ownerData.ts           helpers para el owner
│   ├── mocks.ts               establecimientos/géneros demo
│   └── types.ts               tipos compartidos
├── app.json
├── eas.json                   config de EAS Build (APK/IPA)
└── package.json
```

## Probar en celular (sin publicar en stores)

### Durante desarrollo

1. Instala **Expo Go** en tu celular (Play Store / App Store, gratis)
2. Corre `npm start`
3. Escanea el QR — la app aparece dentro de Expo Go

### Para compartir APK con el equipo

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

Te da un link a un `.apk` en la nube. Lo mandan por WhatsApp/Drive y cualquiera lo instala.

## Mapeo HU → pantallas

| HU | Pantalla |
|---|---|
| HU-07 registro cliente | `app/(auth)/register.tsx` (chip Cliente) |
| HU-08 registro establecimiento | `app/(auth)/register.tsx` (chip Dueño) + `app/establishment/manage.tsx` (crear) |
| HU-02 filtros | `app/(tabs)/index.tsx` modal Filtros |
| HU-09 favoritos toggle | `app/establishment/[id].tsx` botón ♥ |
| HU-10 historial favoritos | `app/(tabs)/favorites.tsx` |
| HU-2.5 enlaces | `app/establishment/manage.tsx` sección Enlaces |
| RF11 aforo | `app/establishment/manage.tsx` sección Aforo |
