-- =============================================================
-- Rumbea - Schema inicial Sprint 0
-- =============================================================
-- Cubre HU-07, HU-08, HU-02, HU-09, HU-2.5, HU-10
-- =============================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- TIPOS / ENUMS
-- =============================================================

create type user_role as enum ('client', 'establishment_owner');
create type establishment_category as enum ('discoteca', 'bar', 'cocteleria', 'lounge', 'pub', 'otro');

-- =============================================================
-- PROFILES (1:1 con auth.users)
-- =============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'client',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: crea profile automáticamente cuando se registra un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- GÉNEROS MUSICALES (catálogo)
-- =============================================================

create table musical_genres (
  id serial primary key,
  name text not null unique
);

-- =============================================================
-- ESTABLISHMENTS
-- =============================================================

create table establishments (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text not null,
  category establishment_category not null,
  theme text,
  description text,
  max_capacity int not null check (max_capacity > 0),
  current_occupancy int not null default 0 check (current_occupancy >= 0),
  cover_price int not null default 0 check (cover_price >= 0),
  photo_url text,
  is_premium boolean not null default false,
  is_active boolean not null default true,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occupancy_within_capacity check (current_occupancy <= max_capacity),
  constraint unique_name_address unique (name, address)
);

create index idx_establishments_category on establishments(category);
create index idx_establishments_is_active on establishments(is_active);

-- =============================================================
-- ESTABLISHMENT GENRES (N:M)
-- =============================================================

create table establishment_genres (
  establishment_id uuid not null references establishments(id) on delete cascade,
  genre_id int not null references musical_genres(id) on delete cascade,
  primary key (establishment_id, genre_id)
);

-- =============================================================
-- ESTABLISHMENT SCHEDULES
-- =============================================================

create table establishment_schedules (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time time not null,
  close_time time not null,
  unique (establishment_id, day_of_week)
);

-- =============================================================
-- ESTABLISHMENT LINKS (HU-2.5, HU-06)
-- =============================================================

create table establishment_links (
  id uuid primary key default uuid_generate_v4(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  label text not null,
  url text not null,
  created_at timestamptz not null default now(),
  unique (establishment_id, url)
);

-- =============================================================
-- FAVORITES (HU-09, HU-10)
-- =============================================================

create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, establishment_id)
);

create index idx_favorites_user on favorites(user_id, created_at desc);

-- =============================================================
-- REVIEWS (preparada, RF3 - no sprint 0 pero deja lista la base)
-- =============================================================

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  establishment_id uuid not null references establishments(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, establishment_id)
);

create index idx_reviews_establishment on reviews(establishment_id);

-- =============================================================
-- TRIGGER updated_at genérico
-- =============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function public.set_updated_at();
create trigger establishments_updated_at before update on establishments
  for each row execute function public.set_updated_at();
