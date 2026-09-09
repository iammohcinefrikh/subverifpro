import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ShieldCheck, FileCheck2, User, LogOut, Home, PlusCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-subtle no-print">
      {/* Top Banner (Marianne / Official Institution look) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Système National de Réception des Demandes de Financement Public & Associatif</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              OCR Client Sécurisé (Zero Persistence)
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Session 2026</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3.5 group cursor-pointer text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight group-hover:text-brand-700 transition-colors">
                SubVerif
              </span>
              <span className="bg-brand-50 text-brand-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-brand-200">
                Portail National
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Vérification Préalable, Classification & Extraction Numérique des Pièces
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-3 text-xs">
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>

          {/* Onglet Déposer un dossier accessible uniquement si le candidat est authentifié */}
          {isAuthenticated && user && (
            <Link
              to="/candidature"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                location.pathname === '/candidature'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Nouveau dossier</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  location.pathname === '/dashboard'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user.nomCourt}</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Se déconnecter"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                location.pathname === '/login'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span>Espace Candidat</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

