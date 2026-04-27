export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
  useMocks: (process.env.EXPO_PUBLIC_USE_MOCKS ?? 'true').toLowerCase() === 'true',
};

export const hasSupabaseConfig = () =>
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
