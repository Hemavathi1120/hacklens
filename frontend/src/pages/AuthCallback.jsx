import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // 1. Check for errors in URL search or hash
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || `Authentication error (${error})`);
        }

        // 2. Exchange code if PKCE code parameter exists
        const code = urlParams.get('code');
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 3. Verify active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user || user) {
          if (!isMounted) return;
          setStatus('success');
          // Clean up hash/query from URL and route to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 600);
        } else {
          // If no session yet, wait briefly for onAuthStateChange
          const timeout = setTimeout(() => {
            if (isMounted) {
              navigate('/dashboard', { replace: true });
            }
          }, 1500);
          return () => clearTimeout(timeout);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('OAuth Callback Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete authentication.');
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden cockpit-grid">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-red-600/20 to-rose-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-8 text-center space-y-6 relative z-10 text-zinc-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-600/25 border border-red-500/30">
          <Sparkles className="w-6 h-6" />
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-display text-zinc-100">Authenticating with HackLens</h2>
            <p className="text-xs text-zinc-400">Verifying security tokens and initializing your judging cockpit...</p>
            <div className="pt-4 flex justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-display text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Authenticated!
            </h2>
            <p className="text-xs text-zinc-400">Redirecting to your HackLens Dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                <AlertCircle className="w-4 h-4" />
                OAuth Authentication Note
              </div>
              <p className="text-xs text-red-300 leading-relaxed font-normal">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/25 border border-red-500/30 transition-all"
            >
              Return to Login Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
