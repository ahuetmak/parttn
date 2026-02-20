import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, userType: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL - usar dominio personalizado en producción
const API_URL = window.location.hostname === 'localhost' 
  ? 'https://bxcrcumkdzzdfepjetuw.supabase.co/functions/v1/make-server-1c8a6aaa'
  : 'https://bxcrcumkdzzdfepjetuw.supabase.co/functions/v1/make-server-1c8a6aaa';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Obtener perfil del usuario desde el backend
        const response = await fetch(
          `${API_URL}/auth/session`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        refreshSession();
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        await refreshSession();
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string, userType: string) => {
    try {
      // Llamar al endpoint de signup en el backend
      const response = await fetch(
        `${API_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name, userType }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Error creando cuenta' };
      }

      // Iniciar sesión automáticamente
      const signInResult = await signIn(email, password);
      return signInResult;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/role-selection',
        },
      });

      if (error) return { error };

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}