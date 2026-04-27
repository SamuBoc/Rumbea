import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { env } from './env';
import { getSupabase } from './supabase';
import type { Profile, UserRole } from './types';

interface AuthState {
  ready: boolean;
  user: Profile | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpClient: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  signUpOwner: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

const MOCK_CLIENT: Profile = {
  id: 'mock-client-1',
  full_name: 'Usuario Demo',
  role: 'client',
};
const MOCK_OWNER: Profile = {
  id: 'mock-owner-1',
  full_name: 'Owner Demo',
  role: 'establishment_owner',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(
    async (
      userId: string,
      fallback?: { full_name?: string; role?: UserRole; avatar_url?: string },
    ): Promise<Profile> => {
      const supa = getSupabase();
      if (!supa) {
        return {
          id: userId,
          full_name: fallback?.full_name ?? '',
          role: fallback?.role ?? 'client',
        };
      }
      const { data } = await supa
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          full_name: data.full_name ?? fallback?.full_name ?? '',
          role: (data.role as UserRole) ?? fallback?.role ?? 'client',
          avatar_url: data.avatar_url ?? fallback?.avatar_url,
        };
      }
      return {
        id: userId,
        full_name: fallback?.full_name ?? '',
        role: fallback?.role ?? 'client',
        avatar_url: fallback?.avatar_url,
      };
    },
    [],
  );

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setReady(true);
      return;
    }
    let active = true;
    supa.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        const u = data.session.user;
        const profile = await loadProfile(u.id, {
          full_name: u.user_metadata?.full_name as string,
          role: u.user_metadata?.role as UserRole,
        });
        if (active) setUser(profile);
      }
      if (active) setReady(true);
    });
    const { data: sub } = supa.auth.onAuthStateChange(async (_evt, session) => {
      if (!active) return;
      if (session?.user) {
        const u = session.user;
        const profile = await loadProfile(u.id, {
          full_name: u.user_metadata?.full_name as string,
          role: u.user_metadata?.role as UserRole,
        });
        if (active) setUser(profile);
      } else {
        setUser(null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    const supa = getSupabase();
    if (!supa) {
      if (!email || !password) throw new Error('Credenciales vacías');
      setUser(email.toLowerCase().includes('owner') ? MOCK_OWNER : MOCK_CLIENT);
      return;
    }
    const { data, error } = await supa.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const profile = await loadProfile(data.user.id, {
        full_name: data.user.user_metadata?.full_name as string,
        role: data.user.user_metadata?.role as UserRole,
      });
      setUser(profile);
    }
  };

  const signUp = async (
    role: UserRole,
    input: { email: string; password: string; fullName: string },
  ) => {
    const supa = getSupabase();
    if (!supa) {
      setUser({
        id: `mock-${role}-${Date.now()}`,
        full_name: input.fullName,
        role,
      });
      return;
    }
    const { data, error } = await supa.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName, role },
      },
    });
    if (error) throw error;
    if (!data.session) {
      throw new Error(
        'Cuenta creada. Revisa tu correo para confirmar antes de iniciar sesión.',
      );
    }
    if (data.user) {
      const profile = await loadProfile(data.user.id, {
        full_name: input.fullName,
        role,
      });
      setUser(profile);
    }
  };

  const signOut = async () => {
    const supa = getSupabase();
    if (!supa) {
      setUser(null);
      return;
    }
    await supa.auth.signOut();
    setUser(null);
  };

  const refreshProfile = useCallback(async () => {
    const supa = getSupabase();
    if (!supa || !user) return;
    const fresh = await loadProfile(user.id, {
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
    });
    setUser(fresh);
  }, [user, loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      user,
      signInWithEmail,
      signUpClient: (input) => signUp('client', input),
      signUpOwner: (input) => signUp('establishment_owner', input),
      signOut,
      refreshProfile,
    }),
    [ready, user, refreshProfile],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useOptionalUser() {
  const { user } = useAuth();
  return user;
}

export function useRequireAuth(): Profile | null {
  const { user } = useAuth();
  return user;
}

export const isMockMode = () => env.useMocks || !getSupabase();
