-- =============================================================
-- Row Level Security (RLS) - Rumbea
-- =============================================================
-- Asegura que:
-- - Cualquiera autenticado puede leer establecimientos, géneros, schedules, links
-- - Solo el owner edita su establecimiento y sus links/schedules
-- - Solo el propio usuario ve/edita sus favoritos y su profile
-- =============================================================

-- Helper: ¿el user actual es el owner del establecimiento?
create or replace function public.is_owner(est_id uuid)
returns boolean as $$
  select exists (
    select 1 from establishments
    where id = est_id and owner_id = auth.uid()
  );
$$ language sql stable security definer;

-- =============================================================
-- profiles
-- =============================================================
alter table profiles enable row level security;

create policy "profiles_select_all_authenticated"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- =============================================================
-- musical_genres (catálogo público)
-- =============================================================
alter table musical_genres enable row level security;

create policy "genres_select_all"
  on musical_genres for select
  to anon, authenticated
  using (true);

-- =============================================================
-- establishments
-- =============================================================
alter table establishments enable row level security;

create policy "establishments_select_active"
  on establishments for select
  to anon, authenticated
  using (is_active = true or owner_id = auth.uid());

create policy "establishments_insert_owner"
  on establishments for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'establishment_owner'
    )
  );

create policy "establishments_update_owner"
  on establishments for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "establishments_delete_owner"
  on establishments for delete
  to authenticated
  using (owner_id = auth.uid());

-- =============================================================
-- establishment_genres
-- =============================================================
alter table establishment_genres enable row level security;

create policy "est_genres_select_all"
  on establishment_genres for select
  to anon, authenticated
  using (true);

create policy "est_genres_write_owner"
  on establishment_genres for all
  to authenticated
  using (public.is_owner(establishment_id))
  with check (public.is_owner(establishment_id));

-- =============================================================
-- establishment_schedules
-- =============================================================
alter table establishment_schedules enable row level security;

create policy "schedules_select_all"
  on establishment_schedules for select
  to anon, authenticated
  using (true);

create policy "schedules_write_owner"
  on establishment_schedules for all
  to authenticated
  using (public.is_owner(establishment_id))
  with check (public.is_owner(establishment_id));

-- =============================================================
-- establishment_links (HU-2.5)
-- =============================================================
alter table establishment_links enable row level security;

create policy "links_select_all"
  on establishment_links for select
  to anon, authenticated
  using (true);

create policy "links_write_owner"
  on establishment_links for all
  to authenticated
  using (public.is_owner(establishment_id))
  with check (public.is_owner(establishment_id));

-- =============================================================
-- favorites (HU-09, HU-10)
-- =============================================================
alter table favorites enable row level security;

create policy "favorites_select_self"
  on favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_self"
  on favorites for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_self"
  on favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- =============================================================
-- reviews
-- =============================================================
alter table reviews enable row level security;

create policy "reviews_select_all"
  on reviews for select
  to anon, authenticated
  using (true);

create policy "reviews_insert_self"
  on reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "reviews_update_self"
  on reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews_delete_self"
  on reviews for delete
  to authenticated
  using (user_id = auth.uid());
