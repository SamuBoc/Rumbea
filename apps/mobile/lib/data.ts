import { env } from './env';
import { mockEstablishments, mockGenres, mockLinks } from './mocks';
import { getSupabase } from './supabase';
import type {
  Establishment,
  EstablishmentLink,
  Genre,
  SearchFilters,
} from './types';

const mockFavoriteIds = new Set<string>();

const EST_SELECT = `
  *,
  establishment_genres (
    musical_genres ( id, name )
  )
` as const;

function toEst(raw: any): Establishment {
  const { establishment_genres, ...rest } = raw;
  const genres: string[] = (establishment_genres ?? [])
    .map((eg: any) => eg?.musical_genres?.name as string)
    .filter(Boolean);
  return { ...rest, genres };
}

export async function listEstablishments(
  filters: SearchFilters = {},
): Promise<Establishment[]> {
  if (env.useMocks) {
    let items = [...mockEstablishments];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q),
      );
    }
    if (filters.category) items = items.filter((e) => e.category === filters.category);
    if (filters.maxCover !== undefined) items = items.filter((e) => e.cover_price <= filters.maxCover!);
    if (filters.hasCapacity) items = items.filter((e) => e.current_occupancy < e.max_capacity);
    if (filters.genreIds?.length) {
      const wanted = new Set(filters.genreIds.map((id) => mockGenres.find((g) => g.id === id)?.name));
      items = items.filter((e) => e.genres?.some((g) => wanted.has(g)));
    }
    if (filters.sortBy === 'recent') items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (filters.sortBy === 'occupancy') items.sort((a, b) => a.current_occupancy / a.max_capacity - b.current_occupancy / b.max_capacity);
    else items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }

  const supa = getSupabase();
  if (!supa) return [];

  let query = supa
    .from('establishments')
    .select(EST_SELECT)
    .eq('is_active', true);

  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,address.ilike.%${filters.q}%`);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.maxCover !== undefined) query = query.lte('cover_price', filters.maxCover);

  if (filters.sortBy === 'recent') query = query.order('created_at', { ascending: false });
  else query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  let rows = data ?? [];

  if (filters.genreIds?.length) {
    const wanted = new Set(filters.genreIds);
    rows = rows.filter((raw: any) =>
      (raw.establishment_genres ?? []).some((eg: any) => wanted.has(eg.musical_genres?.id)),
    );
  }

  let items = rows.map(toEst);

  if (filters.hasCapacity) items = items.filter((e) => e.current_occupancy < e.max_capacity);
  if (filters.sortBy === 'occupancy') {
    items.sort((a, b) => a.current_occupancy / a.max_capacity - b.current_occupancy / b.max_capacity);
  }

  return items;
}

export async function getEstablishment(id: string): Promise<Establishment | null> {
  if (env.useMocks) return mockEstablishments.find((e) => e.id === id) ?? null;

  const supa = getSupabase();
  if (!supa) return null;

  const { data, error } = await supa
    .from('establishments')
    .select(EST_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return toEst(data);
}

export async function listGenres(): Promise<Genre[]> {
  if (env.useMocks) return mockGenres;

  const supa = getSupabase();
  if (!supa) return [];

  const { data, error } = await supa
    .from('musical_genres')
    .select('id, name')
    .order('name');

  if (error) return [];
  return data ?? [];
}

export async function listLinks(establishmentId: string): Promise<EstablishmentLink[]> {
  if (env.useMocks) return mockLinks[establishmentId] ?? [];

  const supa = getSupabase();
  if (!supa) return [];

  const { data, error } = await supa
    .from('establishment_links')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('created_at');

  if (error) return [];
  return data ?? [];
}

export async function createLink(
  establishmentId: string,
  label: string,
  url: string,
): Promise<EstablishmentLink> {
  if (env.useMocks) {
    const link: EstablishmentLink = {
      id: `mock-link-${Date.now()}`,
      establishment_id: establishmentId,
      label,
      url,
      created_at: new Date().toISOString(),
    };
    mockLinks[establishmentId] = [...(mockLinks[establishmentId] ?? []), link];
    return link;
  }

  const supa = getSupabase()!;
  const { data, error } = await supa
    .from('establishment_links')
    .insert({ establishment_id: establishmentId, label, url })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLink(
  establishmentId: string,
  linkId: string,
): Promise<void> {
  if (env.useMocks) {
    mockLinks[establishmentId] = (mockLinks[establishmentId] ?? []).filter((l) => l.id !== linkId);
    return;
  }

  const supa = getSupabase()!;
  const { error } = await supa
    .from('establishment_links')
    .delete()
    .eq('id', linkId)
    .eq('establishment_id', establishmentId);
  if (error) throw error;
}

export async function listFavorites(): Promise<Establishment[]> {
  if (env.useMocks) return mockEstablishments.filter((e) => mockFavoriteIds.has(e.id));

  const supa = getSupabase();
  if (!supa) return [];

  const { data, error } = await supa
    .from('favorites')
    .select(`establishments(${EST_SELECT})`);

  if (error) return [];
  return (data ?? [])
    .map((row: any) => row.establishments)
    .filter(Boolean)
    .map(toEst);
}

export async function addFavorite(establishmentId: string): Promise<void> {
  if (env.useMocks) { mockFavoriteIds.add(establishmentId); return; }

  const supa = getSupabase()!;
  const { data: { session } } = await supa.auth.getSession();
  if (!session) return;
  const { error } = await supa
    .from('favorites')
    .insert({ user_id: session.user.id, establishment_id: establishmentId });
  if (error) throw error;
}

export async function removeFavorite(establishmentId: string): Promise<void> {
  if (env.useMocks) { mockFavoriteIds.delete(establishmentId); return; }

  const supa = getSupabase()!;
  const { data: { session } } = await supa.auth.getSession();
  if (!session) return;
  const { error } = await supa
    .from('favorites')
    .delete()
    .eq('user_id', session.user.id)
    .eq('establishment_id', establishmentId);
  if (error) throw error;
}

export async function isFavorite(establishmentId: string): Promise<boolean> {
  if (env.useMocks) return mockFavoriteIds.has(establishmentId);

  const supa = getSupabase();
  if (!supa) return false;

  const { data } = await supa
    .from('favorites')
    .select('establishment_id')
    .eq('establishment_id', establishmentId)
    .maybeSingle();
  return data !== null;
}

export async function updateOccupancy(
  establishmentId: string,
  occupancy: number,
): Promise<void> {
  if (env.useMocks) {
    const est = mockEstablishments.find((e) => e.id === establishmentId);
    if (est) est.current_occupancy = occupancy;
    return;
  }

  const supa = getSupabase()!;
  const { error } = await supa
    .from('establishments')
    .update({ current_occupancy: occupancy })
    .eq('id', establishmentId);
  if (error) throw error;
}
