import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  FolderKanban, 
  User, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Bell,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeProject }) {
  const { user, signOut, logout, getDisplayName, getDisplayAvatar, getAuthProvider } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDropdownOpen(false);
    try {
      if (typeof signOut === 'function') {
        await signOut();
      } else if (typeof logout === 'function') {
        await logout();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      navigate('/login');
    }
  };

  const displayName = getDisplayName(user);
  const displayEmail = user?.email || (user?.id === 'demo-user' ? 'alex.chen@projectlens.ai' : 'judge@hacklens.ai');
  const displayAvatar = getDisplayAvatar(user);
  const provider = getAuthProvider(user);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/85 backdrop-blur-xl shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-zinc-900 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform border border-red-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-zinc-100 bg-clip-text text-transparent">
                  HACKLENS<span className="text-red-500 ml-0.5">.AI</span>
                </span>
                <span className="text-[9px] tracking-wider uppercase text-zinc-400 -mt-1 font-bold">
                  Judge Intelligence
                </span>
              </div>
            </Link>

            {/* Active Project Indicator in Nav */}
            {activeProject && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800">
                <span className="text-xs text-zinc-500 font-medium">Active:</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="truncate max-w-[180px]">{activeProject.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`
              }
            >
              <Layers className="w-4 h-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`
              }
            >
              <FolderKanban className="w-4 h-4" />
              Projects
            </NavLink>

            {activeProject && (
              <>
                <NavLink
                  to={`/projects/${activeProject.id}/board`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`
                  }
                >
                  <Layers className="w-4 h-4" />
                  AI Board
                </NavLink>

                <NavLink
                  to={`/projects/${activeProject.id}/evaluation`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`
                  }
                >
                  <Award className="w-4 h-4" />
                  Evaluations
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Action: Notifications & Profile User Badge */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all text-left shadow-xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{displayName ? displayName[0].toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-semibold text-zinc-200 leading-tight truncate max-w-[120px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[110px]">
                      {displayEmail}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 py-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-zinc-800 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{displayName}</p>
                        <p className="text-[10px] text-zinc-500 truncate font-mono">{displayEmail}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold uppercase text-zinc-400 font-mono tracking-wider flex-shrink-0">
                        {provider}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Judge Profile & Diagnostics
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer text-left font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/25 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
