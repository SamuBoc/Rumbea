import { env } from './env';
import { getSupabase } from './supabase';

async function authHeader(): Promise<Record<string, string>> {
  const s = getSupabase();
  if (!s) return {};
  const { data } = await s.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
    ...(await authHeader()),
  };
  const res = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
