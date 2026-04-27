import { env } from './env';
import { mockEstablishments } from './mocks';
import { getSupabase } from './supabase';
import type { Establishment } from './types';

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

export async function getMyEstablishment(ownerId: string): Promise<Establishment | null> {
  if (env.useMocks) {
    return mockEstablishments.find((e) => e.owner_id === ownerId) ?? null;
  }

  const supa = getSupabase();
  if (!supa) return null;

  const { data, error } = await supa
    .from('establishments')
    .select(EST_SELECT)
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error || !data) return null;
  return toEst(data);
}

export async function createEstablishment(
  ownerId: string,
  input: {
    name: string;
    address: string;
    category: Establishment['category'];
    theme?: string;
    description?: string;
    max_capacity: number;
    cover_price: number;
    photo_url?: string;
  },
): Promise<Establishment> {
  if (env.useMocks) {
    const e: Establishment = {
      id: `mock-own-${Date.now()}`,
      owner_id: ownerId,
      ...input,
      theme: input.theme ?? null,
      description: input.description ?? null,
      photo_url: input.photo_url ?? null,
      current_occupancy: 0,
      is_premium: false,
      is_active: true,
      genres: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockEstablishments.push(e);
    return e;
  }

  const supa = getSupabase()!;
  const { data, error } = await supa
    .from('establishments')
    .insert({
      owner_id: ownerId,
      name: input.name,
      address: input.address,
      category: input.category,
      theme: input.theme ?? null,
      description: input.description ?? null,
      max_capacity: input.max_capacity,
      cover_price: input.cover_price,
      photo_url: input.photo_url ?? null,
    })
    .select(EST_SELECT)
    .single();

  if (error) throw error;
  return toEst(data);
}

export async function updateEstablishment(
  id: string,
  patch: Partial<{
    name: string;
    address: string;
    category: Establishment['category'];
    theme: string | null;
    description: string | null;
    max_capacity: number;
    cover_price: number;
    photo_url: string | null;
  }>,
): Promise<Establishment> {
  if (env.useMocks) {
    const idx = mockEstablishments.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('not found');
    mockEstablishments[idx] = {
      ...mockEstablishments[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    } as Establishment;
    return mockEstablishments[idx];
  }

  const supa = getSupabase()!;
  const { data, error } = await supa
    .from('establishments')
    .update(patch)
    .eq('id', id)
    .select(EST_SELECT)
    .single();

  if (error) throw error;
  return toEst(data);
}
