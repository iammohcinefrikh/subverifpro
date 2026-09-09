import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ShieldCheck, User, LogOut, Home, PlusCircle } from 'lucide-react';
import { KhatemSeal, RegionalThemeSwitcher, useMoroccanTheme } from '../moroccan/MoroccanPatterns';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { primaryColor, isFes } = useMoroccanTheme();

  return (
    <header className="bg-sand-50/95 backdrop-blur-md border-b border-sand-300 sticky top-0 z-40 shadow-subtle no-print transition-colors">
      {/* 1. Bandeau Institutionnel Supérieur */}
      <div className="bg-indigo-950 text-sand-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-gold-500/20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="font-semibold text-gold-400">ROYAUME DU MAROC</span>
            <span className="text-sand-400 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Guichet Unique Numérique des Subventions Publiques</span>
          </div>
          <div className="flex items-center gap-4 text-sand-300 text-[11px]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Traitement OCR Local & Souverain</span>
            </span>
            <span className="hidden md:inline text-gold-500/40">|</span>
            <span className="hidden md:inline text-sand-400">Exercice 2026</span>
          </div>
        </div>
      </div>

      {/* 2. Barre Principale de Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Emblème Sceau Khatem */}
        <Link to="/" className="flex items-center gap-3.5 group cursor-pointer text-left">
          <div className="relative flex items-center justify-center p-2 rounded-2xl bg-sand-200/80 border border-gold-400/40 group-hover:border-gold-500 shadow-sm transition-all">
            <KhatemSeal size={30} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl sm:text-[1.65rem] text-indigo-950 tracking-tight group-hover:text-terracotta-600 transition-colors">
                SubVerif
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase"
                style={{
                  backgroundColor: isFes ? '#DCE8F6' : '#FAF4E3',
                  color: isFes ? '#1E4F8C' : '#8F3209',
                  borderColor: isFes ? '#BED4ED' : '#F4E7C3',
                }}
              >
                Portail d'État
              </span>
            </div>
            <p className="text-[11.5px] text-ink-800/75 font-medium hidden sm:block">
              Dépôt Dématérialisé, Classification & Extraction Sécurisée des Pièces
            </p>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sélecteur de Thème Régional (Atlas Terracotta ⇄ Fès Cobalt) */}
          <RegionalThemeSwitcher />

          <nav className="flex items-center gap-2 text-xs">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                location.pathname === '/'
                  ? 'bg-sand-200 text-indigo-950 border border-sand-300'
                  : 'text-ink-800/80 hover:text-indigo-950 hover:bg-sand-200/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            {/* Nouveau dossier accessible aux candidats connectés */}
            {isAuthenticated && user && (
              <Link
                to="/candidature"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  location.pathname === '/candidature'
                    ? 'bg-terracotta-500 text-white shadow-sm shadow-terracotta-900/20'
                    : 'text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200'
                }`}
                style={
                  location.pathname === '/candidature'
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nouveau dossier</span>
              </Link>
            )}

            {/* Profil ou Connexion */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-sand-300">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-white shadow-sm transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{user.nomCourt}</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  title="Se déconnecter"
                  className="p-1.5 text-sand-500 hover:text-terracotta-700 hover:bg-sand-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold border border-sand-300 bg-white hover:bg-sand-50 text-indigo-950 shadow-subtle hover:border-gold-400 transition-all"
              >
                <User className="w-3.5 h-3.5 text-terracotta-500" style={{ color: primaryColor }} />
                <span>Espace Candidat</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
