import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function AuthPage() {
  const { 
    signInWithGoogle, 
    signInWithGithub, 
    signInWithEmail, 
    signUpWithEmail, 
    signInAsGuest, 
    signInAsDemo, 
    oauthLoading,
    user 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showSandbox, setShowSandbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeProvider, setActiveProvider] = useState(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Check for errors returned in query params or hash from OAuth redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = urlParams.get('error') || hashParams.get('error');
    const errorDesc = urlParams.get('error_description') || hashParams.get('error_description');

    if (error || errorDesc) {
      setErrorMsg(decodeURIComponent(errorDesc || error || 'OAuth login could not be completed.'));
    }
  }, [location]);

  const handleOAuth = async (provider) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActiveProvider(provider);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
    } catch (err) {
      console.error(`${provider} Auth Error:`, err);
      setErrorMsg(
        err.message?.includes('provider is not enabled')
          ? `${provider.toUpperCase()} provider is not yet enabled in the Supabase project console. You can use 1-Click Instant Demo or Email login below!`
          : (err.message || `Failed to authenticate with ${provider}.`)
      );
      setActiveProvider(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password.trim(), fullName.trim());
        setSuccessMsg('Account created successfully! Taking you to the cockpit...');
      } else {
        await signInWithEmail(email.trim(), password.trim());
        setSuccessMsg('Signed in successfully! Loading dashboard...');
      }
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      signInAsDemo();
      try {
        await api.seedDemo();
      } catch (_) {}
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Please provide your name for guest access.');
      return;
    }
    setLoading(true);
    try {
      signInAsGuest(guestName.trim(), guestEmail.trim());
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Failed to create guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden cockpit-grid selection:bg-red-500/30 selection:text-red-200">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-red-600/20 via-rose-600/15 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-800/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-7 sm:p-9 relative z-10 space-y-6 text-zinc-100 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center text-white shadow-lg shadow-red-600/25 border border-red-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-zinc-100">
              HACKLENS <span className="text-red-500">AI</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-normal">
              Autonomous Hackathon Project Intelligence & Judging Cockpit
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              mode === 'signin'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl font-bold transition-all ${
              mode === 'signup'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            PROMINENT GOOGLE & GITHUB SOCIAL AUTH BUTTONS
            ========================================================================= */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google OAuth Button */}
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading || activeProvider !== null}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-700/80 hover:border-red-500/40 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {activeProvider === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            {/* GitHub OAuth Button */}
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading || activeProvider !== null}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-700/80 hover:border-red-500/40 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {activeProvider === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : (
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              <span>{mode === 'signup' ? 'Sign up with GitHub' : 'Continue with GitHub'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">
              Or with email
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
        </div>

        {/* =========================================================================
            EMAIL & PASSWORD FORM
            ========================================================================= */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black transition-colors"
                  placeholder="Judge Alex Chen"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black transition-colors"
                placeholder="judge@hacklens.ai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:bg-black transition-colors"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || activeProvider !== null}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] border border-red-500/30 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Launch Cockpit' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* =========================================================================
            QUICK ACCESS SANDBOX (DEMO & GUEST)
            ========================================================================= */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-3">
          
          {/* 1-Click Instant Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || activeProvider !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Zap className="w-4 h-4 text-red-400 animate-pulse" />
            <span>1-Click Demo Login (Pre-Loaded CivicLens AI)</span>
          </button>

          {/* Collapsible Guest Mode */}
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              <span className="font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Quick Guest Session (No Password)
              </span>
              {showSandbox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSandbox && (
              <form onSubmit={handleGuestLogin} className="p-4 pt-1 space-y-2.5 border-t border-zinc-800/60 animate-in fade-in">
                <p className="text-[11px] text-zinc-400 font-normal">
                  Enter your name to jump right in as a temporary judge evaluator:
                </p>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  placeholder="e.g. Maya Lin"
                  required={showSandbox}
                />
                <button
                  type="submit"
                  disabled={loading || !guestName.trim()}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 cursor-pointer disabled:opacity-50"
                >
                  Enter Cockpit as Guest
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
