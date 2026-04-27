-- =============================================================
-- Storage bucket para fotos de establecimientos (HU-08)
-- =============================================================

insert into storage.buckets (id, name, public)
values ('establishment-photos', 'establishment-photos', true)
on conflict (id) do nothing;

-- Cualquiera puede leer
create policy "photos_read_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'establishment-photos');

-- Solo usuarios autenticados pueden subir, y el archivo debe estar en su carpeta (uid/)
create policy "photos_upload_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
