import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { DossierTimeline } from '../components/dashboard/DossierTimeline';
import { MissingDocumentsCard } from '../components/dashboard/MissingDocumentsCard';
import { DossierDocumentsTable } from '../components/dashboard/DossierDocumentsTable';
import {
  Calendar,
  Coins,
  Copy,
  Check,
  LogOut,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { decodeJwtClaims } from '../services/jwtService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, jwtToken, isAuthenticated, logout, refreshUser, availableDemoCandidates, loginAsDemo } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [showJwtModal, setShowJwtModal] = React.useState(false);
  const [tokenCopied, setTokenCopied] = React.useState(false);

  // Redirection protégée : si pas authentifié -> /login.
  // Si candidat nouvellement inscrit sans dossier créé/soumis -> /candidature
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    } else if (user.hasSubmittedDossier === false || (!user.hasSubmittedDossier && user.dossier.pieces.length === 0)) {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const decodedClaims = jwtToken ? decodeJwtClaims(jwtToken) : null;

  const formattedDate = new Date(user.dossier.date_soumission).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getStatusBadge = () => {
    switch (user.dossier.statut) {
      case 'documents_manquants':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Documents Manquants
          </span>
        );
      case 'en_cours_examen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            En cours d'examen
          </span>
        );
      case 'valide':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            Dossier Validé & Accordé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            En attente d'attribution
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
      {/* 1. Header Banner Candidat */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {user.structureType}
              </span>
              {getStatusBadge()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {user.structureNom}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Représentant : <strong>{user.demandeur.prenom_representant} {user.demandeur.nom_representant}</strong></span>
              <span>•</span>
              <span>ICE / SIRET : <code className="font-mono text-slate-700">{user.demandeur.siret}</code></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {jwtToken && (
              <button
                type="button"
                onClick={() => setShowJwtModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                title="Inspecter le jeton d'authentification JWT"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>JWT Actif</span>
              </button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Identifiant Dossier (UUID)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 truncate">
                {user.dossier.dossier_id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                title="Copier le numéro de dossier"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Date de transmission
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Subvention sollicitée
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
              <Coins className="w-3.5 h-3.5 text-brand-600" />
              <span>{user.budget.montant_demande.toLocaleString('fr-FR')} DH</span>
              <span className="text-slate-400 font-normal">/ {user.budget.montant_total.toLocaleString('fr-FR')} DH total</span>
            </div>
          </div>
        </div>

        {/* Demo Fast Switcher Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-brand-50/50 p-3 rounded-xl border border-brand-100">
          <div className="flex items-center gap-2 text-brand-800 font-semibold">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Tester un autre profil démo :</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableDemoCandidates.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => loginAsDemo(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  c.id === user.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {c.nomCourt} ({c.dossier.statut})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Timeline Progression */}
      <DossierTimeline
        statut={user.dossier.statut}
        dateSoumission={user.dossier.date_soumission}
        decisionDate={user.dossier.decision_date}
      />

      {/* 3. Section Documents Manquants (si le statut le requiert) */}
      {user.dossier.statut === 'documents_manquants' && (
        <MissingDocumentsCard user={user} onDossierUpdated={refreshUser} />
      )}

      {/* Si dossier en cours d'examen */}
      {user.dossier.statut === 'en_cours_examen' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Dossier en cours d'instruction technique</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Vos pièces justificatives et compléments ont été vérifiés. Les membres de la commission d'attribution procèdent à l'évaluation technique et financière de votre projet. Vous recevrez une notification dès qu'une décision sera prononcée.
          </p>
        </div>
      )}

      {/* Si dossier validé */}
      {user.dossier.statut === 'valide' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Subvention accordée avec succès</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Félicitations ! Votre demande a été validée par la commission. Une convention de financement a été émise et vous sera adressée par voie électronique sécurisée.
          </p>
        </div>
      )}

      {/* 4. Table des pièces du dossier */}
      <DossierDocumentsTable user={user} />

      {/* Modal d'inspection JWT */}
      {showJwtModal && jwtToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Jeton d'Authentification JWT (HMAC-SHA256)
                  </h3>
                  <p className="text-xs text-slate-500">Signé et stocké localement dans SUBVERIF_JWT_TOKEN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJwtModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Claims décodés */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Claims Décodés :</span>
                <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto">
                  {JSON.stringify(decodedClaims, null, 2)}
                </pre>
              </div>

              {/* Jeton brut encodé */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Token JWT Encodé :</span>
                <div className="relative">
                  <p className="text-[11px] font-mono bg-slate-100 border border-slate-200 p-3 rounded-xl break-all text-slate-700 max-h-28 overflow-y-auto">
                    {jwtToken}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyToken}
                leftIcon={tokenCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {tokenCopied ? 'Token copié (Bearer) !' : 'Copier Token (Bearer)'}
              </Button>

              <button
                type="button"
                onClick={() => setShowJwtModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
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

