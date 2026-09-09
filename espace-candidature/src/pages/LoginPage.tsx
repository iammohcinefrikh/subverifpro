import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/useAuth';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  ArrowRight,
  FileWarning,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  Search,
  Check,
  Building2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MOCK_CANDIDATES } from '../config/mockCandidates';
import type { MockCandidate } from '../config/mockCandidates';
import { getStoredSession } from '../services/mockAuthService';

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(4, 'Le mot de passe doit comporter au moins 4 caractères')
});

const signUpSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit comporter au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  confirm_password: z.string().min(6, 'Veuillez confirmer votre mot de passe')
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, signUp, loginAsDemo, availableDemoCandidates, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pour la sélection et simulation des candidats mockés en Sign Up
  const [selectedMockCandidate, setSelectedMockCandidate] = useState<MockCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  // Formulaire de connexion
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setValueLogin,
    formState: { errors: loginErrors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Formulaire d'inscription simplifié (nom, prénom, email, password, confirm)
  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    setValue: setValueSignUp,
    formState: { errors: signUpErrors }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      password: '',
      confirm_password: ''
    }
  });

  // Si déjà connecté sur l'onglet connexion, rediriger selon l'état d'avancement du dossier
  React.useEffect(() => {
    if (isAuthenticated && activeTab === 'login') {
      if (user?.hasSubmittedDossier) {
        navigate('/dashboard');
      } else {
        navigate('/candidature');
      }
    }
  }, [isAuthenticated, activeTab, user, navigate]);

  /**
   * Filtrage des candidats mockés pour le Sign Up
   */
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CANDIDATES;
    const q = searchQuery.toLowerCase().trim();
    return MOCK_CANDIDATES.filter((c) =>
      c.nomCourt.toLowerCase().includes(q) ||
      c.demandeur.nom_ou_raison_sociale.toLowerCase().includes(q) ||
      c.demandeur.prenom_representant.toLowerCase().includes(q) ||
      c.demandeur.nom_representant.toLowerCase().includes(q) ||
      c.demandeur.email_representant.toLowerCase().includes(q) ||
      c.demandeur.ville.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayedCandidates = useMemo(() => {
    if (showAllCandidates || searchQuery.trim()) {
      return filteredCandidates;
    }
    return filteredCandidates.slice(0, 4);
  }, [filteredCandidates, showAllCandidates, searchQuery]);

  /**
   * Soumission du Login -> redirection vers le Dashboard
   */
  const onLoginSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        const stored = getStoredSession();
        if (stored?.hasSubmittedDossier) {
          navigate('/dashboard');
        } else {
          // Premier dépôt : diriger vers la création du dossier
          navigate('/candidature');
        }
      } else {
        setAuthError(res.error || 'Identifiants invalides.');
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Soumission du Sign Up manuel -> génération JWT -> redirection vers /candidature
   */
  const onSignUpSubmit = async (data: SignUpFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await signUp(data, selectedMockCandidate || undefined);
      if (res.success) {
        navigate('/candidature');
      } else {
        setAuthError(res.error || 'Erreur lors de la création du compte.');
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Simulation directe d'un candidat mocké en 1 clic
   */
  const handleSimulateCandidateSignUp = async (candidate: MockCandidate) => {
    setAuthError(null);
    setIsSubmitting(true);
    setSelectedMockCandidate(candidate);

    try {
      const res = await signUp(
        {
          prenom: candidate.demandeur.prenom_representant,
          nom: candidate.demandeur.nom_representant,
          email: candidate.demandeur.email_representant,
          password: 'password123',
          confirm_password: 'password123'
        },
        candidate
      );

      if (res.success) {
        navigate('/candidature');
      } else {
        setAuthError(res.error || "Erreur lors de l'inscription simulée.");
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Pré-remplissage du formulaire Sign Up avec le candidat choisi
   */
  const handleSelectMockCandidateForForm = (candidate: MockCandidate) => {
    setSelectedMockCandidate(candidate);
    setValueSignUp('prenom', candidate.demandeur.prenom_representant, { shouldValidate: true });
    setValueSignUp('nom', candidate.demandeur.nom_representant, { shouldValidate: true });
    setValueSignUp('email', candidate.demandeur.email_representant, { shouldValidate: true });
    setValueSignUp('password', 'password123', { shouldValidate: true });
    setValueSignUp('confirm_password', 'password123', { shouldValidate: true });
  };

  /**
   * Connexion Démo directe (Login)
   */
  const handleConnectDemo = async (candidateId?: string) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const targetUser = await loginAsDemo(candidateId);
      setValueLogin('email', targetUser.email);
      setValueLogin('password', targetUser.password);
      navigate('/dashboard');
    } catch {
      setAuthError('Erreur de connexion démo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'documents_manquants':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <FileWarning className="w-3 h-3" />
            Documents manquants
          </span>
        );
      case 'en_cours_examen':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3" />
            En cours d'examen
          </span>
        );
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Dossier validé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      <div className={`w-full space-y-6 transition-all duration-200 ${activeTab === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Espace Candidat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {activeTab === 'login'
              ? 'Connectez-vous pour suivre votre dossier et régulariser vos pièces.'
              : 'Créez votre compte pour initier votre dossier et recevoir votre jeton d\'accès JWT.'}
          </p>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer un compte (Sign Up)
          </button>
        </div>

        {/* 1. Zone Démonstration / Candidats Mockés */}
        {activeTab === 'login' ? (
          /* Encart démo pour la Connexion */
          <div className="bg-gradient-to-br from-brand-50 via-white to-sky-50 rounded-2xl p-5 border border-brand-200 shadow-card space-y-3.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                  Accès Démo Instantané
                </span>
              </div>
              <span className="text-[10px] font-medium bg-brand-100 text-brand-800 px-2 py-0.5 rounded-md">
                Avec JWT Signé
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Connectez-vous directement avec nos comptes de démonstration pour tester le dashboard et la gestion des pièces :
            </p>

            <div className="space-y-2">
              {availableDemoCandidates.slice(0, 3).map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => handleConnectDemo(candidate.id)}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-brand-50/60 border border-slate-200 hover:border-brand-300 transition-all flex items-center justify-between group shadow-subtle cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-brand-700 transition-colors">
                        {candidate.nomCourt}
                      </span>
                      {getStatusBadge(candidate.dossier.statut)}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {candidate.email} • {candidate.dossier.dossier_id}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleConnectDemo()}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Connecter le cas Démo (Documents Manquants)</span>
            </button>
          </div>
        ) : (
          /* ================= LISTE DE BOUTONS DES CANDIDATS MOCKÉS POUR SIGN UP ================= */
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/70 rounded-2xl p-5 border border-emerald-200 shadow-card space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900">
                    Candidats Mockés du Flux de Subvention
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Cliquez sur un bouton pour simuler l'inscription (1-clic) ou pré-remplir le formulaire :
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono bg-emerald-100/90 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                {MOCK_CANDIDATES.length} candidats disponibles
              </span>
            </div>

            {/* Champ de recherche rapide */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un candidat mocké (nom, entreprise, ville, secteur)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Button List : chaque élément est une carte actionnable */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredCandidates.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  Aucun candidat ne correspond à votre recherche.
                </div>
              ) : (
                displayedCandidates.map((candidate) => {
                  const isSelected = selectedMockCandidate?.id === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-200'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Info Candidat */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-500" />
                              {candidate.nomCourt}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {candidate.badge}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                <Check className="w-3 h-3" /> Rempli
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <span className="font-medium text-slate-800">
                              {candidate.demandeur.prenom_representant} {candidate.demandeur.nom_representant}
                            </span>{' '}
                            • <span className="text-slate-500">{candidate.demandeur.email_representant}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-sm sm:max-w-md">
                            {candidate.demandeur.ville} • {candidate.projet.objet_projet}
                          </p>
                        </div>

                        {/* Boutons d'action pour ce candidat */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelectMockCandidateForForm(candidate)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                            title="Pré-remplir le formulaire d'inscription ci-dessous"
                          >
                            Pré-remplir
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSimulateCandidateSignUp(candidate)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Simule l'inscription avec génération JWT immédiate et redirection"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>⚡ Simuler (1-clic)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Toggle Afficher tous les candidats */}
            {filteredCandidates.length > 4 && !showAllCandidates && !searchQuery && (
              <button
                type="button"
                onClick={() => setShowAllCandidates(true)}
                className="w-full py-2 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white/80 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Afficher tous les {filteredCandidates.length} candidats mockés du flux de subvention ↓
              </button>
            )}
            {showAllCandidates && !searchQuery && (
              <button
                type="button"
                onClick={() => setShowAllCandidates(false)}
                className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Réduire la liste ↑
              </button>
            )}
          </div>
        )}

        {/* 2. Formulaire principal (Connexion OU Inscription) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-5 text-left">
          {/* Accessible Error Banner */}
          {authError && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Erreur :</span>
                <p>{authError}</p>
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            /* ================= FORMULAIRE CONNEXION ================= */
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Adresse E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!loginErrors.email}
                    aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                      loginErrors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="nom@entreprise.ma"
                    {...registerLogin('email')}
                  />
                </div>
                {loginErrors.email && (
                  <p id="login-email-error" className="text-xs text-rose-600 font-medium">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Mot de passe
                  </label>
                  <span className="text-[11px] text-slate-400">(Démo : password123)</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!loginErrors.password}
                    aria-describedby={loginErrors.password ? 'login-password-error' : undefined}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                      loginErrors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="••••••••"
                    {...registerLogin('password')}
                  />
                </div>
                {loginErrors.password && (
                  <p id="login-password-error" className="text-xs text-rose-600 font-medium">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center mt-2"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Se connecter & Accéder au Dashboard
              </Button>
            </form>
          ) : (
            /* ================= FORMULAIRE SIGN UP (SIMPLIFIÉ) ================= */
            <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="space-y-4" noValidate>
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ou enregistrer un compte manuellement
                </h3>
                <p className="text-[11px] text-slate-500">
                  Renseignez vos identifiants pour générer votre session et accéder au parcours de candidature.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Prénom */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-prenom"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="signup-prenom"
                      type="text"
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                        signUpErrors.prenom
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                      }`}
                      placeholder="Youssef"
                      {...registerSignUp('prenom')}
                    />
                  </div>
                  {signUpErrors.prenom && (
                    <p className="text-xs text-rose-600 font-medium">{signUpErrors.prenom.message}</p>
                  )}
                </div>

                {/* Nom */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-nom"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Nom
                  </label>
                  <input
                    id="signup-nom"
                    type="text"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      signUpErrors.nom
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="EL AMRANI"
                    {...registerSignUp('nom')}
                  />
                  {signUpErrors.nom && (
                    <p className="text-xs text-rose-600 font-medium">{signUpErrors.nom.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Adresse E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      signUpErrors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="contact@entreprise.ma"
                    {...registerSignUp('email')}
                  />
                </div>
                {signUpErrors.email && (
                  <p className="text-xs text-rose-600 font-medium">{signUpErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      signUpErrors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="Au moins 6 caractères"
                    {...registerSignUp('password')}
                  />
                </div>
                {signUpErrors.password && (
                  <p className="text-xs text-rose-600 font-medium">{signUpErrors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Confirmation du mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      signUpErrors.confirm_password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                    }`}
                    placeholder="Retapez votre mot de passe"
                    {...registerSignUp('confirm_password')}
                  />
                </div>
                {signUpErrors.confirm_password && (
                  <p className="text-xs text-rose-600 font-medium">{signUpErrors.confirm_password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Créer mon compte & Déposer mon dossier
                </Button>
                <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jeton JWT sécurisé généré dès l'enregistrement</span>
                </p>
              </div>
            </form>
          )}

          {/* Bascule de bas de formulaire */}
          <div className="pt-4 border-t border-slate-100 text-center">
            {activeTab === 'login' ? (
              <p className="text-xs text-slate-500">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setAuthError(null);
                  }}
                  className="font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                >
                  Créer mon compte
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setAuthError(null);
                  }}
                  className="font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
