import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/useAuth';
import {
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  ArrowRight,
  FileWarning,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  Check,
  Building2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MOCK_CANDIDATES } from '../config/mockCandidates';
import type { MockCandidate } from '../config/mockCandidates';
import { getStoredSession } from '../services/mockAuthService';
import {
  ZelligePattern,
  KhatemSeal,
  useMoroccanTheme,
} from '../components/moroccan/MoroccanPatterns';

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(4, 'Le mot de passe doit comporter au moins 4 caractères'),
});

const signUpSchema = z
  .object({
    prenom: z.string().min(2, 'Le prénom doit comporter au moins 2 caractères'),
    nom: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
    email: z.string().email('Adresse e-mail invalide'),
    password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
    confirm_password: z.string().min(6, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signUp, availableDemoCandidates } = useAuth();
  const { primaryColor } = useMoroccanTheme();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [duplicateAccountEmail, setDuplicateAccountEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbRegisteredEmails, setDbRegisteredEmails] = useState<Set<string>>(new Set());

  // Pour la sélection et simulation des candidats mockés en Sign Up
  const [selectedMockCandidate, setSelectedMockCandidate] = useState<MockCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  // Formulaire de connexion
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: 'password123',
    },
  });

  // Charger la liste des e-mails déjà enregistrés en base pour l'affichage visuel
  React.useEffect(() => {
    fetch('/api/candidate-users')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.candidates)) {
          setDbRegisteredEmails(new Set(data.candidates.map((c: any) => String(c.email).toLowerCase().trim())));
        }
      })
      .catch(() => {});
  }, []);

  // Formulaire d'enregistrement
  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    setValue: setSignUpValue,
    watch: watchSignUp,
    formState: { errors: signUpErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      password: 'password123',
      confirm_password: 'password123',
    },
  });

  const watchedSignUpEmail = watchSignUp('email');

  // Détection en temps réel si l'e-mail est déjà enregistré
  const isEmailAlreadyRegistered = useMemo(() => {
    if (!watchedSignUpEmail) return false;
    const clean = watchedSignUpEmail.trim().toLowerCase();
    return dbRegisteredEmails.has(clean);
  }, [watchedSignUpEmail, dbRegisteredEmails]);

  // Filtrage des candidats mockés selon la recherche
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CANDIDATES;
    const q = searchQuery.toLowerCase();
    return MOCK_CANDIDATES.filter(
      (c) =>
        c.nomCourt.toLowerCase().includes(q) ||
        c.demandeur.nom_ou_raison_sociale.toLowerCase().includes(q) ||
        c.demandeur.email_representant.toLowerCase().includes(q) ||
        c.demandeur.ville.toLowerCase().includes(q) ||
        c.badge.toLowerCase().includes(q) ||
        c.projet.objet_projet.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayedCandidates = useMemo(() => {
    if (showAllCandidates || searchQuery.trim()) {
      return filteredCandidates;
    }
    return filteredCandidates.slice(0, 4);
  }, [filteredCandidates, showAllCandidates, searchQuery]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        const stored = getStoredSession();
        // Tout candidat ayant un dossier ou présent en base est dirigé vers le dashboard
        if (stored?.hasSubmittedDossier || (stored?.dossier && stored.dossier.pieces.length > 0) || stored?.dossier?.dossier_id) {
          navigate('/dashboard');
        } else {
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

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setAuthError(null);
    setDuplicateAccountEmail(null);

    const cleanEmail = data.email.trim().toLowerCase();
    if (dbRegisteredEmails.has(cleanEmail)) {
      const errorMsg = 'Vous possédez déjà un compte ou un dossier avec cette adresse e-mail. Veuillez vous connecter pour accéder à votre tableau de bord.';
      setAuthError(errorMsg);
      setDuplicateAccountEmail(data.email.trim());
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp(data, selectedMockCandidate || undefined);
      if (res.success) {
        navigate('/candidature');
      } else {
        const errorMsg = res.error || 'Erreur lors de la création du compte.';
        setAuthError(errorMsg);
        if (
          errorMsg.toLowerCase().includes('déjà') ||
          errorMsg.toLowerCase().includes('existe') ||
          errorMsg.toLowerCase().includes('already') ||
          errorMsg.toLowerCase().includes('compte')
        ) {
          setDuplicateAccountEmail(data.email.trim());
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Une erreur inattendue est survenue.';
      setAuthError(errorMsg);
      if (
        errorMsg.toLowerCase().includes('déjà') ||
        errorMsg.toLowerCase().includes('existe') ||
        errorMsg.toLowerCase().includes('already') ||
        errorMsg.toLowerCase().includes('compte')
      ) {
        setDuplicateAccountEmail(data.email.trim());
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateCandidateSignUp = async (candidate: MockCandidate) => {
    setAuthError(null);
    setDuplicateAccountEmail(null);
    setIsSubmitting(true);
    setSelectedMockCandidate(candidate);

    const email = candidate.demandeur.email_representant;

    try {
      const res = await signUp(
        {
          prenom: candidate.demandeur.prenom_representant,
          nom: candidate.demandeur.nom_representant,
          email: email,
          password: 'password123',
          confirm_password: 'password123',
        },
        candidate
      );

      if (res.success) {
        navigate('/candidature');
      } else {
        const errorMsg = res.error || "Erreur lors de l'enregistrement du candidat mocké.";
        setAuthError(errorMsg);
        if (errorMsg.toLowerCase().includes('déjà')) {
          setDuplicateAccountEmail(email);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur de simulation.';
      setAuthError(errorMsg);
      if (errorMsg.toLowerCase().includes('déjà')) {
        setDuplicateAccountEmail(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMockCandidateForForm = (candidate: MockCandidate) => {
    setSelectedMockCandidate(candidate);
    setSignUpValue('prenom', candidate.demandeur.prenom_representant);
    setSignUpValue('nom', candidate.demandeur.nom_representant);
    setSignUpValue('email', candidate.demandeur.email_representant);
    setSignUpValue('password', 'password123');
    setSignUpValue('confirm_password', 'password123');
  };

  const handleConnectDemo = async (candidateId?: string) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const target = candidateId
        ? availableDemoCandidates.find((c) => c.id === candidateId)
        : (availableDemoCandidates[0] || null);

      const targetEmail = target?.email || 'amina@bio-atlas.ma';
      const success = await login(targetEmail, 'password123');
      if (success.success) {
        navigate('/dashboard');
      } else {
        setAuthError(success.error || 'Aucun utilisateur trouvé en base PostgreSQL. Veuillez créer un compte ou exécuter database/auth_users.sql.');
      }
    } catch {
      setAuthError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'documents_manquants':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300">
            <FileWarning className="w-3 h-3 text-gold-700" />
            Compléments requis
          </span>
        );
      case 'en_cours_examen':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-fes-100 text-fes-800 border border-fes-200">
            <Clock className="w-3 h-3 text-fes-600" />
            En instruction
          </span>
        );
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Validé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200 text-ink-800 border border-sand-300">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-[88vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* Trame Zellige en filigrane sur fond de page */}
      <ZelligePattern id="zel-login" color={primaryColor} opacity={0.04} />

      <div className={`relative z-10 w-full space-y-6 transition-all duration-300 ${activeTab === 'signup' ? 'max-w-2xl' : 'max-w-lg'}`}>
        {/* Arche monumentale BabPanel encadrant la porte d'accès */}
        <div
          className="relative p-1.5 shadow-bab transition-all"
          style={{
            background: `linear-gradient(160deg, #C9962E 0%, ${primaryColor} 100%)`,
            borderRadius: '999px 999px 24px 24px',
          }}
        >
          <div
            className="relative bg-sand-50 rounded-b-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-left"
            style={{
              borderRadius: '999px 999px 20px 20px',
              border: '1.5px solid rgba(201, 150, 46, 0.35)',
            }}
          >
            {/* Liserés concentriques en haut de l'arc */}
            <div
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-36 border border-gold-400/20 rounded-full pointer-events-none"
              aria-hidden="true"
            />

            {/* En-tête avec Sceau Khatem et Titre Institutionnel */}
            <div className="text-center pt-8 pb-2 space-y-2 relative z-10">
              <div className="flex justify-center mb-1">
                <div className="p-3 rounded-2xl bg-white shadow-card border border-gold-400/40 inline-flex items-center justify-center">
                  <KhatemSeal size={36} strokeWidth={1.8} />
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold text-indigo-950 tracking-tight">
                Porte d’Accès Sécurisée
              </h1>
              <p className="text-xs sm:text-[13px] text-ink-800/75 max-w-sm mx-auto leading-relaxed">
                {activeTab === 'login'
                  ? 'Connectez-vous pour instruire votre dossier, téléverser vos pièces ou régulariser vos compléments.'
                  : 'Créez votre compte pour initier votre candidature et générer votre session certifiée.'}
              </p>
            </div>

            {/* Onglets Connexion / Inscription façon pavage */}
            <div className="bg-sand-200/90 p-1 rounded-xl flex items-center text-xs font-bold border border-sand-300">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'login'
                    ? 'bg-white text-indigo-950 shadow-sm border border-sand-300'
                    : 'text-sand-500 hover:text-indigo-950'
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
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'signup'
                    ? 'bg-white text-indigo-950 shadow-sm border border-sand-300'
                    : 'text-sand-500 hover:text-indigo-950'
                }`}
              >
                Créer un compte (Sign Up)
              </button>
            </div>

            {/* Zone Démonstration / Comptes Mockés */}
            {activeTab === 'login' ? (
              <div className="bg-white/85 rounded-2xl p-5 border border-gold-400/30 shadow-subtle space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      Accès Démo Instantané
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-sand-200 text-indigo-950 px-2 py-0.5 rounded-full border border-sand-300">
                    Session Certifiée JWT
                  </span>
                </div>

                <p className="text-xs text-ink-800/80 leading-relaxed">
                  Sélectionnez un profil test pour accéder immédiatement au dashboard et au suivi documentaire :
                </p>

                <div className="space-y-2">
                  {availableDemoCandidates.slice(0, 3).map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => handleConnectDemo(candidate.id)}
                      className="w-full text-left p-3 rounded-xl bg-sand-50 hover:bg-white border border-sand-300 hover:border-gold-400 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-indigo-950 group-hover:text-terracotta-600 transition-colors">
                            {candidate.nomCourt}
                          </span>
                          {getStatusBadge(candidate.dossier.statut)}
                        </div>
                        <p className="text-[11px] text-sand-500">
                          {candidate.email} • {candidate.dossier.dossier_id}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sand-400 group-hover:text-terracotta-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectDemo()}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Accéder directement (Cas Documents Manquants)</span>
                </button>
              </div>
            ) : (
              /* Encart Démo pour Sign Up */
              <div className="bg-white/85 rounded-2xl p-5 border border-emerald-300/40 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-950">
                        Candidats Référents du Royaume
                      </h2>
                      <p className="text-[11px] text-sand-500">
                        Simulez en 1 clic l’inscription d’une structure réelle du catalogue :
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                    {MOCK_CANDIDATES.length} profils disponibles
                  </span>
                </div>

                {/* Recherche */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sand-500">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par raison sociale, ville, secteur..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-sand-300 bg-sand-50 placeholder-sand-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {displayedCandidates.map((candidate) => {
                    const isSelected = selectedMockCandidate?.id === candidate.id;
                    const isAlreadyRegistered = dbRegisteredEmails.has(
                      candidate.demandeur.email_representant.toLowerCase().trim()
                    );
                    return (
                      <div
                        key={candidate.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200'
                            : isAlreadyRegistered
                            ? 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-200/90'
                            : 'bg-sand-50 hover:bg-white border-sand-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-sand-500" />
                                {candidate.nomCourt}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sand-200 text-ink-800 border border-sand-300">
                                {candidate.badge}
                              </span>
                              {isAlreadyRegistered && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full">
                                  ✓ Déjà enregistré en base
                                </span>
                              )}
                              {isSelected && !isAlreadyRegistered && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  <Check className="w-3 h-3" /> Rempli
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-sand-500">
                              {candidate.demandeur.prenom_representant} {candidate.demandeur.nom_representant} • {candidate.demandeur.ville} • <span className="font-mono text-sand-600">{candidate.demandeur.email_representant}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAlreadyRegistered ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('login');
                                  setLoginValue('email', candidate.demandeur.email_representant);
                                  setAuthError(null);
                                  setDuplicateAccountEmail(null);
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-950 bg-amber-200/90 hover:bg-amber-300 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <span>Se connecter</span>
                                <ArrowRight className="w-3.5 h-3.5 text-indigo-950" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMockCandidateForForm(candidate)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ink-800 bg-white hover:bg-sand-100 border border-sand-300 transition-colors cursor-pointer"
                                >
                                  Pré-remplir
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => handleSimulateCandidateSignUp(candidate)}
                                  className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>⚡ 1-clic</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredCandidates.length > 4 && !showAllCandidates && !searchQuery && (
                  <button
                    type="button"
                    onClick={() => setShowAllCandidates(true)}
                    className="w-full py-1.5 text-center text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white rounded-xl border border-sand-300 cursor-pointer"
                  >
                    Afficher tous les {filteredCandidates.length} candidats ↓
                  </button>
                )}
              </div>
            )}

            {/* Formulaire classique */}
            <div className="bg-white rounded-2xl border border-sand-300 shadow-card p-6 space-y-4">
              {authError && (
                <div
                  className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    authError.toLowerCase().includes('déjà') || authError.toLowerCase().includes('existe')
                      ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        authError.toLowerCase().includes('déjà') || authError.toLowerCase().includes('existe') ? 'text-amber-700' : 'text-rose-600'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">
                        {authError.toLowerCase().includes('déjà') || authError.toLowerCase().includes('existe')
                          ? 'Compte ou dossier déjà existant'
                          : 'Attention :'}
                      </p>
                      <p className="leading-relaxed">{authError}</p>
                    </div>
                  </div>

                  {duplicateAccountEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setLoginValue('email', duplicateAccountEmail);
                        setAuthError(null);
                        setDuplicateAccountEmail(null);
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Se connecter à mon dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'login' ? (
                /* Formulaire Connexion */
                <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Adresse E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sand-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="contact@entreprise.ma"
                        {...registerLogin('email')}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-xs text-rose-700 font-medium">{loginErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Mot de passe
                      </label>
                      <span className="text-[11px] text-sand-500">(Démo : password123)</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sand-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="••••••••"
                        {...registerLogin('password')}
                      />
                    </div>
                    {loginErrors.password && (
                      <p className="text-xs text-rose-700 font-medium">{loginErrors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center mt-3"
                    isLoading={isSubmitting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Se connecter & Accéder au Dashboard
                  </Button>
                </form>
              ) : (
                /* Formulaire Inscription */
                <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">Prénom</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="Youssef"
                        {...registerSignUp('prenom')}
                      />
                      {signUpErrors.prenom && <p className="text-xs text-rose-700">{signUpErrors.prenom.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">Nom</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="EL AMRANI"
                        {...registerSignUp('nom')}
                      />
                      {signUpErrors.nom && <p className="text-xs text-rose-700">{signUpErrors.nom.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">Adresse E-mail</label>
                    <input
                      type="email"
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                        isEmailAlreadyRegistered ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/40' : 'border-sand-300 bg-white'
                      } text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400`}
                      placeholder="contact@entreprise.ma"
                      {...registerSignUp('email')}
                    />
                    {signUpErrors.email && <p className="text-xs text-rose-700">{signUpErrors.email.message}</p>}

                    {isEmailAlreadyRegistered && (
                      <div className="p-3 rounded-xl bg-amber-50/95 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in shadow-xs">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="font-semibold">Un compte ou dossier existe déjà avec cet e-mail.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('login');
                            setLoginValue('email', watchedSignUpEmail.trim());
                            setAuthError(null);
                            setDuplicateAccountEmail(null);
                          }}
                          className="shrink-0 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Se connecter</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">Mot de passe</label>
                      <input
                        type="password"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="••••••••"
                        {...registerSignUp('password')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">Confirmation</label>
                      <input
                        type="password"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                        placeholder="••••••••"
                        {...registerSignUp('confirm_password')}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center mt-2"
                    isLoading={isSubmitting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Créer mon compte & Déposer mon dossier
                  </Button>
                </form>
              )}

              <div className="pt-3 border-t border-sand-200 text-center text-xs text-sand-500">
                {activeTab === 'login' ? (
                  <p>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="font-bold text-terracotta-600 hover:underline cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      Créer mon compte
                    </button>
                  </p>
                ) : (
                  <p>
                    Vous avez déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="font-bold text-terracotta-600 hover:underline cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      Se connecter
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
