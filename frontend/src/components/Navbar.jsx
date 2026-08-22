import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  FolderKanban, 
  Award, 
  Bot, 
  FileText, 
  LogOut, 
  User, 
  ChevronDown,
  Bell,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeProject = null }) {
  const { user, isDemoUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { 
      name: 'AI Board', 
      path: activeProject ? `/projects/${activeProject.id}/board` : '/dashboard', 
      icon: Layers 
    },
    { 
      name: 'Evaluations', 
      path: activeProject ? `/projects/${activeProject.id}/evaluation` : '/dashboard', 
      icon: Award 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Breadcrumb */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  PROJECTLENS<span className="text-indigo-400 font-semibold ml-1">AI</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-slate-400 -mt-1 font-medium">Evaluation & RAG</span>
              </div>
            </Link>

            {/* Active Project Indicator */}
            {activeProject && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
                <span className="text-xs text-slate-500">Active:</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {activeProject.name}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path) && (link.path !== '/dashboard' || location.pathname === '/dashboard');
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Section */}
          <div className="flex items-center gap-3">
            {/* Demo Badge */}
            {isDemoUser && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Demo Mode
              </div>
            )}

            {/* Notifications Icon */}
            <button 
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-medium text-slate-200 leading-tight">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User'}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                    {user?.email || 'demo@projectlens.ai'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-800">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {user?.user_metadata?.full_name || 'ProjectLens User'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user?.email || 'demo@projectlens.ai'}
                    </p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Diagnostics
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
