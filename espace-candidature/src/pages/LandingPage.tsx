import React from 'react';
import { Link } from 'react-router-dom';
import {
  DepositIllustration,
  OcrScanIllustration,
  TrackingIllustration
} from '../components/landing/HeroIllustrations';
import { ProcessStepsSection } from '../components/landing/ProcessStepsSection';
import {
  FileCheck2,
  ArrowRight,
  User,
  ShieldCheck,
  Cpu,
  Lock,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const depositTarget = isAuthenticated ? '/candidature' : '/login';

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Soft Background Gradient Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50/70 via-slate-50/20 to-transparent pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-subtle text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portail Officiel Dématérialisé • Session 2026 Ouverte</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Guichet Unique de Dépôt & Vérification Préalable des <span className="text-brand-600">Subventions</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Déposez votre dossier de financement public ou associatif, pré-validez vos pièces par OCR instantané 100% local, et suivez l'instruction de votre dossier en temps réel.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to={depositTarget}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Accéder au dépôt de dossier' : "S'identifier & Déposer une candidature"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm shadow-subtle hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-brand-600" />
                <span>Suivre mon dossier / Se connecter</span>
              </Link>
            </div>

            {/* Trust reassurance pills */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Traitement OCR local en mémoire
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" />
                Chiffrement sécurisé des pièces
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-brand-600" />
                Récépissé horodaté immédiat
              </span>
            </div>
          </div>

          {/* Trio of Original Vector Illustrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 sm:mt-18">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevation transition-all duration-300 group hover:-translate-y-1 text-left space-y-4">
              <div className="h-44 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/60 p-2">
                <DepositIllustration className="w-full max-h-40" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Étape initiale</span>
                <h3 className="font-bold text-slate-900 text-base">Constitution du dossier</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Formulaire intelligent étape par étape avec calculs budgétaires automatisés et contrôle de cohérence.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevation transition-all duration-300 group hover:-translate-y-1 text-left space-y-4">
              <div className="h-44 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/60 p-2">
                <OcrScanIllustration className="w-full max-h-40" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Technologie intégrée</span>
                <h3 className="font-bold text-slate-900 text-base">Scan OCR & Classification</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extraction instantanée par PDF.js et Tesseract. Identification automatique du RIB, du devis et du SIRET/ICE.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevation transition-all duration-300 group hover:-translate-y-1 text-left space-y-4">
              <div className="h-44 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/60 p-2">
                <TrackingIllustration className="w-full max-h-40" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Espace candidat</span>
                <h3 className="font-bold text-slate-900 text-base">Suivi d'instruction en direct</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Visualisation du statut, timeline en 4 jalons et régularisation des pièces manquantes en 1 clic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Process Section (Comment ça marche) */}
      <ProcessStepsSection />

      {/* 3. Reassurance & Technical Guarantees Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-brand-300 text-xs font-semibold border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Architecture Sécurisée & Souveraine</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Une conception respectueuse de vos données et de l'accessibilité
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                SubVerif repose sur un principe d'exécution locale : vos documents administratifs et comptables ne sont pas envoyés sur un serveur tiers pour être analysés. L'analyse optique et les vérifications d'intégrité sont opérées directement par le moteur WebAssembly de votre navigateur.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-brand-300 font-bold text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>Traitement Zero-Cloud</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Extraction OCR 100% exécutée dans la mémoire vive de votre navigateur.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Conformité RGAA</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Navigation intégrale au clavier, balises aria-* et contrastes de couleurs validés.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Transmission Chiffrée</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Payload final expédié par canal HTTPS sécurisé avec horodatage certifié.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pre-Footer Call To Action */}
      <section className="py-14 bg-white border-t border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prêt à soumettre votre dossier de subvention ?
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Accédez directement au wizard de dépôt en 5 étapes ou connectez-vous pour consulter l'état d'avancement d'une demande déjà déposée.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={depositTarget}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Commencer mon dépôt' : "S'identifier pour déposer mon dossier"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>Accéder à l'espace candidat</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
