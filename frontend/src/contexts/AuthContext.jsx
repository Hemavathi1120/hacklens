import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check for existing demo session in localStorage
    const storedDemo = localStorage.getItem('projectlens_demo_user');
    if (storedDemo) {
      const demoUser = JSON.parse(storedDemo);
      setUser(demoUser);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('projectlens_demo_user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      throw err;
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('GitHub Sign-in Error:', err);
      throw err;
    }
  };

  const signInAsDemo = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'alex.chen@projectlens.ai',
      user_metadata: {
        full_name: 'Alex Chen',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    };
    setUser(demoUser);
    setIsDemoUser(true);
    localStorage.setItem('projectlens_demo_user', JSON.stringify(demoUser));
    return demoUser;
  };

  const signOut = async () => {
    localStorage.removeItem('projectlens_demo_user');
    setIsDemoUser(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  };

  const value = {
    user,
    session,
    loading,
    isDemoUser,
    signInWithGoogle,
    signInWithGithub,
    signInAsDemo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
