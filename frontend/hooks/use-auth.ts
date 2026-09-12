'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { AuthUser } from '@/../src/shared/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const LOCAL_STORAGE_USER_KEY = 'life_rpg_auth_user';

export function useAuth(): AuthContextType {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const configured = isSupabaseConfigured();

  React.useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (configured) {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session error:', error.message);
          }
          if (mounted) {
            if (data.session?.user) {
              setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
                displayName: data.session.user.user_metadata?.display_name || 'Adventurer',
              });
            } else {
              setUser(null);
            }
            setLoading(false);
          }
        } catch {
          if (mounted) setLoading(false);
        }
      } else {
        // Local fallback mode when Supabase is not yet configured
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (stored && mounted) {
            setUser(JSON.parse(stored));
          }
        } catch {}
        if (mounted) setLoading(false);
      }
    }

    initSession();

    if (configured) {
      const supabase = getSupabaseClient();
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.display_name || 'Adventurer',
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    } else {
      return () => {
        mounted = false;
      };
    }
  }, [configured]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setLoading(false);
          // Friendly user message instead of raw error
          if (error.message.toLowerCase().includes('invalid login')) {
            return { error: 'Invalid email or password. Please check your credentials.' };
          }
          return { error: error.message };
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.display_name || 'Adventurer',
          });
        }
        setLoading(false);
        return {};
      } else {
        // Offline / Local Demo Authentication
        const localUser: AuthUser = {
          id: 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
          email,
          displayName: email.split('@')[0] || 'Adventurer',
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        setLoading(false);
        return {};
      }
    } catch {
      setLoading(false);
      return { error: 'An unexpected connection error occurred. Please try again.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoading(true);
    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          setLoading(false);
          if (error.message.toLowerCase().includes('already registered')) {
            return { error: 'An account with this email address already exists.' };
          }
          return { error: error.message };
        }

        if (data.user) {
          const requiresEmailConfirmation = !data.session;
          if (data.session) {
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              displayName,
            });
          }
          setLoading(false);
          return { requiresEmailConfirmation };
        }

        setLoading(false);
        return {};
      } else {
        // Offline / Local Demo Registration
        const localUser: AuthUser = {
          id: 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
          email,
          displayName,
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        setLoading(false);
        return { requiresEmailConfirmation: false };
      }
    } catch {
      setLoading(false);
      return { error: 'An unexpected connection error occurred. Please try again.' };
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      if (configured) {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isConfigured: configured,
    signIn,
    signUp,
    signOut,
  };
}
