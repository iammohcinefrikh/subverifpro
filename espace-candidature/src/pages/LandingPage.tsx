import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Landmark,
  Sprout,
  Cpu,
  Building2,
  ArrowUpRight,
  Lock,
  ListChecks,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  ZelligePattern,
  Frieze,
  KhatemSeal,
  useMoroccanTheme,
} from '../components/moroccan/MoroccanPatterns';
import { OcrPreviewCard } from '../components/documents/OcrPreviewCard';

const programs = [
  {
    icon: Building2,
    nom: 'Maroc PME (Istitmar)',
    desc: 'Appui aux investissements productifs des PME industrielles pour accélérer leur modernisation et compétitivité.',
    allocation: 'Prime jusqu’à 30%',
  },
  {
    icon: Sprout,
    nom: 'Green Invest & Tatwir Vert',
    desc: 'Accompagnement financier des projets écologiques : efficacité énergétique, décarbonation et énergies renouvelables.',
    allocation: 'Financement vert subventionné',
  },
  {
    icon: Landmark,
    nom: 'Intelaka / Damane Intelak',
    desc: 'Dispositif intégré d’accès au financement pour les jeunes porteurs de projets, TPE et auto-entrepreneurs avec garantie publique.',
    allocation: 'Taux préférentiel & amorçage',
  },
  {
    icon: Cpu,
    nom: 'Istitmar TPE & Tatwir R&D',
    desc: 'Soutien aux micro-structures et startups innovantes pour l’acquisition d’équipements technologiques et valorisation de brevets.',
    allocation: 'Primes matérielles & immatérielles',
  },
];

const etapes = [
  {
    n: '01',
    titre: 'Renseignez votre dossier',
    texte:
      'Profil de votre structure (SIRET / ICE), descriptif du projet et plan de financement, en 5 étapes fluides.',
  },
  {
    n: '02',
    titre: 'Déposez vos pièces',
    texte:
      'Le moteur OCR lit vos justificatifs directement dans votre navigateur et extrait les données sans transit externe.',
  },
  {
    n: '03',
    titre: 'Suivez l’instruction',
    texte:
      'Ligne du temps chronologique transparente, de la vérification administrative à la décision de la commission.',
  },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { primaryColor, accentColor } = useMoroccanTheme();
  const depositTarget = isAuthenticated ? '/candidature' : '/login';

  return (
    <div className="w-full min-h-screen bg-sand-100 text-ink-900 transition-colors duration-300">
      {/* -------------------------------------------------------------
          1. HERO SECTION
      ------------------------------------------------------------- */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 grid md:grid-cols-12 gap-12 items-center overflow-hidden">
        {/* Trame Zellige géométrique en filigrane (opacité 6% : 5-7%) */}
        <ZelligePattern id="zel-hero" color={primaryColor} opacity={0.06} />

        {/* Colonne gauche : Titre d'État & Appel à l'action */}
        <div className="relative md:col-span-7 space-y-6 text-left">
          {/* Badge institutionnel d'honneur */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sand-300 shadow-subtle text-xs font-semibold text-indigo-950">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="tracking-wide">Guichet Unique Numérique • Session Officielle 2026</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.35rem] leading-[1.08] font-bold text-indigo-950 tracking-tight">
            Le portail d’État des subventions et financements publics.
          </h1>

          <p className="text-base sm:text-[17px] text-ink-900/80 leading-relaxed max-w-xl">
            Déposez votre dossier de financement, bénéficiez de la vérification préalable de vos pièces par reconnaissance optique souveraine dans votre navigateur, et suivez chaque étape de votre instruction.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={depositTarget}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 20px -4px ${primaryColor}40`,
              }}
            >
              <span>{isAuthenticated ? 'Accéder à mon espace' : 'Déposer une candidature'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm border border-indigo-950/40 text-indigo-950 bg-white/60 hover:bg-white hover:border-indigo-950 shadow-subtle transition-all cursor-pointer"
            >
              <span>Suivre mon dossier</span>
            </Link>
          </div>

          {/* Repères chiffrés */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sand-300/80 max-w-md">
            <div>
              <div className="font-display text-3xl font-bold" style={{ color: primaryColor }}>
                4
              </div>
              <div className="text-xs text-sand-500 font-medium mt-0.5">Programmes actifs</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-emerald-700">
                100%
              </div>
              <div className="text-xs text-sand-500 font-medium mt-0.5">OCR local et sécurisé</div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-gold-600">
                5
              </div>
              <div className="text-xs text-sand-500 font-medium mt-0.5">Modules guidés</div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Carte Contrôle Numérique Immédiat (OCR Live Card épurée + Cachet Tabaâ) */}
        <div className="relative md:col-span-5 flex justify-center items-center">
          <OcrPreviewCard />
        </div>
      </section>

      {/* Frise géométrique séparatrice */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Frieze color={accentColor} />
      </div>

      {/* -------------------------------------------------------------
          2. PILIERS DE SOUVERAINETÉ & CONFIANCE
      ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-8 text-left">
        {[
          {
            icon: Lock,
            titre: 'Exécution 100% Côté Client',
            texte:
              'Le traitement OCR s’effectue en direct dans le navigateur du demandeur. Aucun brouillon intermédiaire n’est stocké sur des serveurs distants.',
          },
          {
            icon: Shield,
            titre: 'Souveraineté & Conformité CNDP',
            texte:
              'Conception rigoureuse conforme à la législation marocaine sur la protection des données (Loi 09-08) avec chiffrement de bout en bout.',
          },
          {
            icon: ListChecks,
            titre: 'Vérification Avant Dépôt Définitif',
            texte:
              'Un contrôle d’audit de complétude et une attestation sur l’honneur précèdent chaque transmission officielle.',
          },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/60 border border-sand-300 shadow-subtle hover:border-gold-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sand-200 flex items-center justify-center shrink-0 text-terracotta-600 shadow-sm" style={{ color: primaryColor }}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-base text-indigo-950 font-sans">
                {item.titre}
              </h3>
              <p className="text-xs sm:text-[13px] text-ink-800/80 leading-relaxed">
                {item.texte}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* -------------------------------------------------------------
          3. PROGRAMMES NATIONAUX (CADRES FACON TAMPONS DE CUIR)
      ------------------------------------------------------------- */}
      <section id="programmes" className="relative py-20 bg-indigo-950 text-white overflow-hidden text-left">
        <ZelligePattern id="zel-prog" color={accentColor} opacity={0.06} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900 border border-gold-400/30 text-xs font-semibold text-gold-400">
              <KhatemSeal size={16} fill="#1A2B4C" stroke="#C9962E" strokeWidth={1.5} />
              <span>Programmes Nationaux de Soutien</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white font-bold tracking-tight">
              Quatre guichets officiels, une seule porte d’entrée.
            </h2>
            <p className="text-sm sm:text-base text-sand-300/80 leading-relaxed">
              Votre projet est dirigé avec exactitude vers le dispositif de cofinancement adapté à votre statut juridique et à votre secteur d’activité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((p, i) => (
              <div
                key={i}
                className="group relative p-6 sm:p-7 rounded-2xl bg-[#203254] border border-gold-400/20 hover:border-gold-400/60 shadow-lg transition-all flex gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-400 group-hover:scale-105 transition-transform">
                  <p.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-gold-300 transition-colors">
                      {p.nom}
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold uppercase tracking-wider">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-sand-300/80 leading-relaxed">
                    {p.desc}
                  </p>
                  <div className="pt-2 text-[11px] font-semibold text-gold-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.allocation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frise géométrique séparatrice */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Frieze color={accentColor} />
      </div>

      {/* -------------------------------------------------------------
          4. PARCOURS USAGER EN 3 ETAPES GUIDÉES
      ------------------------------------------------------------- */}
      <section id="parcours" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-left">
        <div className="max-w-xl mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200 border border-sand-300 text-xs font-semibold text-indigo-950">
            <span>Parcours Administratif Dématérialisé</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-indigo-950 font-bold tracking-tight">
            Un fil conducteur limpide, de la candidature à la commission.
          </h2>
          <p className="text-sm text-ink-800/80">
            Une interface épurée garantissant la clarté et l’intégrité de chaque pièce requise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Ligne directrice en arrière plan sur desktop */}
          <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 bg-sand-300 z-0" />

          {etapes.map((e, i) => (
            <div key={i} className="relative z-10 space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold border-2 shadow-sm transition-transform hover:scale-105"
                style={{
                  backgroundColor: '#FAF5EC',
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                {e.n}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg text-indigo-950 font-sans">
                  {e.titre}
                </h3>
                <p className="text-xs sm:text-[13.5px] text-ink-800/80 leading-relaxed">
                  {e.texte}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bannière d'appel final */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-sand-200 border border-gold-400/40 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-lg">
            <h3 className="font-display text-2xl font-bold text-indigo-950">
              Prêt à soumettre votre dossier de subvention ?
            </h3>
            <p className="text-xs sm:text-sm text-ink-800/80">
              Munissez-vous de vos pièces (RIB, Devis, Statuts, CIN) et laissez notre moteur OCR pré-remplir vos formulaires.
            </p>
          </div>
          <Link
            to={depositTarget}
            className="px-6 py-3.5 rounded-full text-white font-semibold text-sm shadow-md transition-all hover:scale-105 shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            Commencer mon dossier
          </Link>
        </div>
      </section>
    </div>
  );
};
