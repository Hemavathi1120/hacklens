import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'github' | null

  // Extract display name from user object across providers
  const getDisplayName = useCallback((u = user) => {
    if (!u) return 'Guest User';
    return (
      u?.user_metadata?.full_name ||
      u?.user_metadata?.name ||
      u?.user_metadata?.user_name ||
      u?.user_metadata?.preferred_username ||
      u?.name ||
      u?.email?.split('@')[0] ||
      'Judge User'
    );
  }, [user]);

  // Extract avatar URL from user object across providers (Google picture, GitHub avatar_url, etc.)
  const getDisplayAvatar = useCallback((u = user) => {
    if (!u) return null;
    return (
      u?.user_metadata?.avatar_url ||
      u?.user_metadata?.picture ||
      u?.identities?.[0]?.identity_data?.avatar_url ||
      u?.identities?.[0]?.identity_data?.picture ||
      u?.avatar ||
      null
    );
  }, [user]);

  // Determine provider name ('google', 'github', 'email', 'demo', 'guest')
  const getAuthProvider = useCallback((u = user) => {
    if (!u) return 'none';
    if (u.id === 'demo-user') return 'demo';
    if (u.id?.startsWith('guest-')) return 'guest';
    const appProvider = u?.app_metadata?.provider;
    if (appProvider) return appProvider;
    const identityProvider = u?.identities?.[0]?.provider;
    if (identityProvider) return identityProvider;
    return 'email';
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    // 1. First establish listener for Supabase auth state changes (OAuth redirects, token refresh, sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setIsDemoUser(false);
        localStorage.removeItem('projectlens_auth_user');
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        // Only clear user if not already a fallback local user
        const storedUser = localStorage.getItem('projectlens_auth_user');
        if (!storedUser) {
          setUser(null);
          setIsDemoUser(false);
        }
      }
      setLoading(false);
    });

    // 2. Query initial Supabase session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;
      
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        setIsDemoUser(false);
        localStorage.removeItem('projectlens_auth_user');
        setLoading(false);
      } else {
        // Fallback to local session storage (demo or guest session)
        const storedUser = localStorage.getItem('projectlens_auth_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setIsDemoUser(parsed.id === 'demo-user');
          } catch (_) {
            localStorage.removeItem('projectlens_auth_user');
          }
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (customRedirect) => {
    setOauthLoading('google');
    try {
      localStorage.removeItem('projectlens_auth_user');
      const targetUrl = customRedirect || `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      throw err;
    } finally {
      setOauthLoading(null);
    }
  };

  const signInWithGithub = async (customRedirect) => {
    setOauthLoading('github');
    try {
      localStorage.removeItem('projectlens_auth_user');
      const targetUrl = customRedirect || `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: targetUrl,
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('GitHub Sign-in Error:', err);
      throw err;
    } finally {
      setOauthLoading(null);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);
        localStorage.removeItem('projectlens_auth_user');
        return data.user;
      }
    } catch (err) {
      console.warn('Supabase remote sign-in fallback:', err);
      const localUser = {
        id: `user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
        email,
        user_metadata: {
          full_name: email.split('@')[0],
        },
        app_metadata: {
          provider: 'email'
        }
      };
      setUser(localUser);
      setIsDemoUser(false);
      localStorage.setItem('projectlens_auth_user', JSON.stringify(localUser));
      return localUser;
    }
  };

  const signUpWithEmail = async (email, password, fullName = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          }
        }
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);
        localStorage.setItem('projectlens_auth_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('Supabase remote sign-up fallback:', err);
      const localUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: {
          full_name: fullName || email.split('@')[0],
        },
        app_metadata: {
          provider: 'email'
        }
      };
      setUser(localUser);
      setIsDemoUser(false);
      localStorage.setItem('projectlens_auth_user', JSON.stringify(localUser));
      return localUser;
    }
  };

  const signInAsGuest = (displayName = 'Guest User', email = '') => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: email || `${displayName.toLowerCase().replace(/\s+/g, '.')}@projectlens.ai`,
      user_metadata: {
        full_name: displayName,
      },
      app_metadata: {
        provider: 'guest'
      }
    };
    setUser(guestUser);
    setIsDemoUser(false);
    localStorage.setItem('projectlens_auth_user', JSON.stringify(guestUser));
    return guestUser;
  };

  const signInAsDemo = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'alex.chen@projectlens.ai',
      user_metadata: {
        full_name: 'Alex Chen',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      app_metadata: {
        provider: 'demo'
      }
    };
    setUser(demoUser);
    setIsDemoUser(true);
    localStorage.setItem('projectlens_auth_user', JSON.stringify(demoUser));
    return demoUser;
  };

  const signOut = async () => {
    localStorage.removeItem('projectlens_auth_user');
    setIsDemoUser(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  };

  const logout = signOut;

  const value = {
    user,
    session,
    loading,
    isDemoUser,
    oauthLoading,
    getDisplayName,
    getDisplayAvatar,
    getAuthProvider,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signInAsDemo,
    signOut,
    logout,
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

