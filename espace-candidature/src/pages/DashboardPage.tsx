import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { DossierTimeline } from '../components/dashboard/DossierTimeline';
import { MissingDocumentsCard } from '../components/dashboard/MissingDocumentsCard';
import { DossierDocumentsTable } from '../components/dashboard/DossierDocumentsTable';
import {
  fetchComplianceCheckFromDb,
  reconcileComplianceCheckWithProgram,
  type ComplianceCheck,
} from '../services/complianceCheckService';
import { updateCandidateDossier } from '../services/mockAuthService';
import {
  Calendar,
  Coins,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  ShieldCheck,
  KeyRound,
  Building2,
  FileText,
  FileEdit,
  Award,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { decodeJwtClaims } from '../services/jwtService';
import { findProgram } from '../config/programs';
import {
  ZelligePattern,
  KhatemSeal,
  useMoroccanTheme,
} from '../components/moroccan/MoroccanPatterns';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, jwtToken, isAuthenticated, refreshUser, availableDemoCandidates, loginAsDemo } = useAuth();
  const { primaryColor } = useMoroccanTheme();
  const [copied, setCopied] = React.useState(false);
  const [showJwtModal, setShowJwtModal] = React.useState(false);
  const [showComplementCard, setShowComplementCard] = React.useState(false);
  const [tokenCopied, setTokenCopied] = React.useState(false);
  const [complianceCheck, setComplianceCheck] = React.useState<ComplianceCheck | null>(null);

  // Charger le contrôle de conformité depuis la table public.compliance_checks
  const loadCompliance = React.useCallback(async (_isSilent = false) => {
    if (!user) return;
    try {
      const rawCheck = await fetchComplianceCheckFromDb(user.id, user.dossier.dossier_id);
      // Réconciliation stricte avec les exigences réelles du programme souscrit
      const check = reconcileComplianceCheckWithProgram(rawCheck, user);
      setComplianceCheck(check);

      // Si compliance_checks a un statut complété / validé, synchroniser automatiquement le statut du dossier
      if (check) {
        const checkStatus = (check.status || '').toUpperCase().trim();
        const isComplete =
          ['COMPLETED', 'COMPLETE', 'CONFORME', 'VALIDATED', 'VALIDE', 'VERIFIE'].includes(checkStatus) ||
          Number(check.completeness_rate) >= 100 ||
          (check.missing_count === 0 && Number(check.present_count) > 0);

        if (isComplete && (user.dossier.statut === 'en_attente' || user.dossier.statut === 'documents_manquants')) {
          updateCandidateDossier(user.id, { statut: 'en_cours_examen' });
          refreshUser();
        }
      }
    } catch (err) {
      console.warn('[Dashboard] Erreur chargement compliance_checks:', err);
    }
  }, [user, refreshUser]);

  React.useEffect(() => {
    if (!user) return;
    loadCompliance();

    // Synchronisation automatique en continu toutes les 3 secondes
    const interval = setInterval(() => {
      loadCompliance(true);
    }, 3000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        loadCompliance(true);
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [user, loadCompliance]);

  // Redirection protégée
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    } else if (user.hasSubmittedDossier === false && user.dossier.pieces.length === 0 && !user.dossier.dossier_id) {
      navigate('/candidature', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) {
    return null;
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.dossier.dossier_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToken = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(`Bearer ${jwtToken}`);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const decodedClaims = jwtToken ? decodeJwtClaims(jwtToken) : null;

  // Résolution du programme officiel
  const programId = complianceCheck?.program_id || user.projet.programme_id || 'prog-istitmar-tpe';
  const program = findProgram(programId);
  const programName = program?.nom || (programId === 'prog-istitmar-tpe' ? 'Istitmar TPE' : programId);
  const programCategory = program?.categorie || 'Maroc PME • Dispositif National';

  const formattedDate = new Date(user.dossier.date_soumission).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getStatusBadge = () => {
    switch (user.dossier.statut) {
      case 'documents_manquants':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-900 border border-gold-300">
            <AlertTriangle className="w-3.5 h-3.5 text-gold-700" />
            <span>Compléments Requis</span>
          </span>
        );
      case 'en_cours_examen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fes-100 text-fes-800 border border-fes-300">
            <Clock className="w-3.5 h-3.5 text-fes-600" />
            <span>En Instruction Technique</span>
          </span>
        );
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dossier Validé & Accordé</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sand-200 text-ink-900 border border-sand-300">
            <Clock className="w-3.5 h-3.5 text-sand-500" />
            <span>En attente de commission</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-6 py-4 text-left relative">
      {/* Trame Zellige légère en arrière-plan */}
      <ZelligePattern id="zel-dash" color={primaryColor} opacity={0.03} />

      {/* 1. Carte Principale de l'Entité & Métadonnées */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl border border-sand-300 shadow-sm p-4 sm:p-5 space-y-3.5 overflow-hidden">
        {/* Ligne d'état & Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-950 bg-sand-200 px-2.5 py-0.5 rounded-full border border-sand-300">
            {user.structureType}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300">
            <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{programName}</span>
          </span>
          {getStatusBadge()}
        </div>

        {/* Titre Principal de l'Entité */}
        <div className="flex items-center gap-2.5">
          <Building2 className="w-6 h-6 shrink-0" style={{ color: primaryColor }} />
          <h1 className="font-display font-serif text-2xl sm:text-3xl font-bold text-indigo-950 tracking-tight leading-tight">
            {user.structureNom}
          </h1>
        </div>

        {/* Détails de l'Entité & Métadonnées (Grille Key-Value aérée) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-sand-200">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider block">
              Programme
            </span>
            <p className="text-sm font-semibold text-emerald-950 truncate" title={`${programName} (${programCategory})`}>
              {programName}
            </p>
            <p className="text-xs text-sand-400 truncate">{programCategory}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider block">
              Objet du Projet
            </span>
            <p className="text-sm font-semibold text-indigo-950 line-clamp-2" title={user.projet.objet_projet}>
              {user.projet.objet_projet}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider block">
              Représentant Légal
            </span>
            <p className="text-sm font-semibold text-indigo-950 truncate">
              {user.demandeur.prenom_representant} {user.demandeur.nom_representant}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider block">
              Identifiant Commun (ICE)
            </span>
            <p className="text-sm font-mono font-semibold text-indigo-950">
              {user.demandeur.siret}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider block">
              Ville d'Implantation
            </span>
            <p className="text-sm font-semibold text-indigo-950">
              {user.demandeur.ville}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Barre d'Actions Principales (Action Bar dédiée sous la carte) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-sand-300 shadow-sm px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Actions du dossier */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/candidature"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs hover:brightness-105 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
            title="Mettre à jour l'ensemble de votre dossier de candidature"
          >
            <FileEdit className="w-4 h-4" />
            <span>Mettre à jour le dossier</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowComplementCard((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border border-amber-400/80 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Modifier ou ajouter des pièces justificatives au dossier"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>{showComplementCard ? 'Masquer pièces' : 'Compléter / Modifier pièces'}</span>
          </button>

          {jwtToken && (
            <button
              type="button"
              onClick={() => setShowJwtModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Inspecter le jeton d'authentification JWT signé"
            >
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Session JWT</span>
            </button>
          )}
        </div>

        {/* 🧪 Mode Démo : Changer de candidat (Dropdown compact) */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-sand-200">
          <label htmlFor="demo-profile-select" className="text-xs font-semibold text-sand-500 whitespace-nowrap flex items-center gap-1.5">
            <KhatemSeal size={15} strokeWidth={1.5} />
            <span className="text-[11px] font-bold text-indigo-950">Mode Démo :</span>
          </label>
          <div className="relative min-w-[250px]">
            <select
              id="demo-profile-select"
              aria-label="Changer de profil démo"
              value={user.id}
              onChange={(e) => loginAsDemo(e.target.value)}
              className="w-full appearance-none bg-sand-50 hover:bg-white text-indigo-950 border border-sand-300 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-indigo-950 transition-all"
            >
              {availableDemoCandidates.map((c) => {
                const statusLabel =
                  c.dossier.statut === 'documents_manquants'
                    ? 'Pièces manquantes'
                    : c.dossier.statut === 'en_attente'
                    ? 'En attente'
                    : c.dossier.statut === 'valide'
                    ? 'Conforme'
                    : c.dossier.statut;
                return (
                  <option key={c.id} value={c.id}>
                    {c.nomCourt} ({statusLabel.toUpperCase()})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-sand-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Cartes de Statut & KPI Top-Bar (Grille uniforme grid-cols-4 de même hauteur) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/90 border border-sand-300 shadow-2xs border-l-4 border-l-emerald-600 flex flex-col justify-between h-full space-y-2">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Programme d'Attribution
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Award className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate" title={programName}>{programName}</span>
            </div>
            <p className="text-[10px] text-sand-500 truncate mt-0.5" title={programCategory}>
              {programCategory}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/90 border border-sand-300 shadow-2xs flex flex-col justify-between h-full space-y-2">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Identifiant Unique Dossier
          </span>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-bold text-indigo-950 truncate" title={user.dossier.dossier_id}>
              {user.dossier.dossier_id}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1 hover:bg-sand-200 rounded text-sand-500 transition-colors cursor-pointer shrink-0"
              title="Copier l'identifiant du dossier"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/90 border border-sand-300 shadow-2xs flex flex-col justify-between h-full space-y-2">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Date de Transmission
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/90 border border-sand-300 shadow-2xs flex flex-col justify-between h-full space-y-2">
          <span className="text-[10px] font-bold text-sand-500 uppercase tracking-wider block">
            Subvention Sollicitée
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: primaryColor }}>
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{user.budget.montant_demande.toLocaleString('fr-FR')} MAD</span>
            <span className="text-sand-500 font-normal text-[11px] shrink-0">/ {user.budget.montant_total.toLocaleString('fr-FR')} MAD</span>
          </div>
        </div>
      </div>

      {/* 2. Ruelle de Médina : Timeline de Statut avec étape Vérification des pièces synchronisée */}
      <DossierTimeline
        statut={user.dossier.statut}
        dateSoumission={user.dossier.date_soumission}
        decisionDate={user.dossier.decision_date}
        complianceCheck={complianceCheck}
      />

      {/* 3. Section Pièces Manquantes & Régularisation */}
      {(user.dossier.statut === 'documents_manquants' ||
        showComplementCard ||
        (complianceCheck && Number(complianceCheck.missing_count) > 0)) && (
        <MissingDocumentsCard
          user={user}
          onDossierUpdated={async () => {
            refreshUser();
            await loadCompliance();
          }}
        />
      )}

      {/* Si dossier en cours d'examen */}
      {user.dossier.statut === 'en_cours_examen' && (
        <div className="bg-fes-50 border border-fes-200 rounded-2xl p-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-fes-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-fes-600" />
            <span>Dossier en cours d’examen par la commission d’attribution</span>
          </div>
          <p className="text-xs text-fes-800 leading-relaxed">
            Vos pièces justificatives et compléments ont été vérifiés. Les experts de la commission étudient actuellement la cohérence économique et technique de votre projet. Vous recevrez une notification officielle dès délibération.
          </p>
        </div>
      )}

      {/* Si dossier validé */}
      {user.dossier.statut === 'valide' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-left space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Subvention d’État officiellement accordée</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Félicitations ! Votre demande a été validée par la commission compétente. Une convention de financement certifiée a été émise et sera transmise via votre espace sécurisé.
          </p>
        </div>
      )}

      {/* 4. Inventaire Documentaire */}
      <DossierDocumentsTable
        user={user}
        onDossierUpdated={async () => {
          refreshUser();
          await loadCompliance();
        }}
        onTriggerComplement={() => setShowComplementCard(true)}
      />

      {/* Modal d'inspection JWT */}
      {showJwtModal && jwtToken && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-sand-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-sand-300 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-indigo-950 text-lg">
                    Jeton d’Authentification Certifié (JWT)
                  </h3>
                  <p className="text-xs text-sand-500">Signé numériquement avec HMAC-SHA256 pour sécuriser vos échanges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJwtModal(false)}
                className="text-sand-500 hover:text-indigo-950 font-bold text-sm px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Claims Décodés :</span>
                <pre className="text-xs font-mono bg-indigo-950 text-emerald-300 p-4 rounded-xl overflow-x-auto border border-gold-400/20">
                  {JSON.stringify(decodedClaims, null, 2)}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Jeton JWT Brut :</span>
                <div className="relative">
                  <p className="text-[11px] font-mono bg-white border border-sand-300 p-3 rounded-xl break-all text-ink-900 max-h-28 overflow-y-auto">
                    {jwtToken}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-sand-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyToken}
                leftIcon={tokenCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {tokenCopied ? 'Jeton copié !' : 'Copier Jeton (Bearer)'}
              </Button>

              <button
                type="button"
                onClick={() => setShowJwtModal(false)}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
