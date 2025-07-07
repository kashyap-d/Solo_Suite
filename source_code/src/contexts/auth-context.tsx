"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, type UserProfile } from "@/lib/supabaseClient"
import { toast } from "sonner";

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, name: string, role: "provider" | "client") => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        // If session or user is invalid, treat as broken session
        if (sessionError || userError || !sessionData.session || !userData?.user) {
          console.warn('❌ Invalid or expired session. Clearing and reloading.');
          localStorage.clear();
          await supabase.auth.signOut();
          location.reload();
          return;
        }

        setUser(userData.user);
        await fetchUserProfile(userData.user.id);
      } catch (err) {
        console.error('Unexpected session error:', err);
        localStorage.clear();
        await supabase.auth.signOut();
        location.reload();
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoadingError(
          'Could not connect to the server. Please check your connection or try again later.'
        );
        setLoading(false);
      }, 10000); // 10 seconds timeout
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    const refreshSession = async () => {
      try {
        await supabase.auth.getSession(); // just to trigger revalidation
      } catch (err) {
        toast.error('Lost connection to the server. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      }
    };

    const handler = () => refreshSession();
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('online', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('online', handler);
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'provider' | 'client'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: data.user.email,
            name,
            role,
          },
        ]);

        if (profileError) throw profileError;
      }

      return { user: data.user };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  if (loadingError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <p style={{ color: 'red', marginBottom: 16 }}>{loadingError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '8px 16px', fontSize: 16 }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
