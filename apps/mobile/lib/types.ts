export type UserRole = 'client' | 'establishment_owner';

export type EstablishmentCategory =
  | 'discoteca'
  | 'bar'
  | 'cocteleria'
  | 'lounge'
  | 'pub'
  | 'otro';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
}

export interface Establishment {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  category: EstablishmentCategory;
  theme?: string | null;
  description?: string | null;
  max_capacity: number;
  current_occupancy: number;
  cover_price: number;
  photo_url?: string | null;
  is_premium: boolean;
  is_active: boolean;
  latitude?: number | null;
  longitude?: number | null;
  genres?: string[];
  created_at: string;
  updated_at: string;
}

export interface EstablishmentLink {
  id: string;
  establishment_id: string;
  label: string;
  url: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchFilters {
  q?: string;
  category?: EstablishmentCategory;
  theme?: string;
  genreIds?: number[];
  maxCover?: number;
  hasCapacity?: boolean;
  sortBy?: 'recent' | 'occupancy';
}
