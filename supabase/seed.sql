-- =============================================================
-- Seed data - Rumbea
-- =============================================================

insert into musical_genres (name) values
  ('Salsa'),
  ('Reggaeton'),
  ('Electrónica'),
  ('Rock'),
  ('Pop'),
  ('Bachata'),
  ('Merengue'),
  ('Vallenato'),
  ('Hip Hop'),
  ('Champeta'),
  ('Crossover'),
  ('Indie')
on conflict (name) do nothing;
