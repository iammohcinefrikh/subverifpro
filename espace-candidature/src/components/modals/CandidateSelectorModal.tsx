import React, { useState, useMemo } from 'react';
import { MOCK_CANDIDATES } from '../../config/mockCandidates';
import type { MockCandidate } from '../../config/mockCandidates';
import { GRANT_PROGRAMS, findProgram } from '../../config/programs';
import { X, User, MapPin, Sparkles, Check, ArrowRight, Search, Filter, FileSpreadsheet } from 'lucide-react';

interface CandidateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (candidate: MockCandidate) => void;
  selectedCandidateId?: string;
}

export const CandidateSelectorModal: React.FC<CandidateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
  selectedCandidateId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');

  // Extraction dynamique des régions
  const regionsList = useMemo(() => {
    const set = new Set<string>();
    MOCK_CANDIDATES.forEach((c) => set.add(c.demandeur.region));
    return Array.from(set).sort();
  }, []);

  // Filtrage combiné (texte + type + région + programme)
  const filteredCandidates = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return MOCK_CANDIDATES.filter((c) => {
      const matchType = selectedType === 'all' || c.demandeur.structure_type === selectedType;
      const matchRegion = selectedRegion === 'all' || c.demandeur.region === selectedRegion;
      const matchProgram = selectedProgramFilter === 'all' || c.projet.programme_id === selectedProgramFilter;

      if (!matchType || !matchRegion || !matchProgram) return false;
      if (!q) return true;

      const prog = findProgram(c.projet.programme_id);
      const progName = prog ? prog.nom.toLowerCase() : '';

      return (
        c.demandeur.nom_ou_raison_sociale.toLowerCase().includes(q) ||
        c.demandeur.ville.toLowerCase().includes(q) ||
        c.demandeur.siret.includes(q) ||
        c.demandeur.secteur_activite.toLowerCase().includes(q) ||
        c.demandeur.nom_representant.toLowerCase().includes(q) ||
        c.demandeur.prenom_representant.toLowerCase().includes(q) ||
        c.demandeur.cin_representant.toLowerCase().includes(q) ||
        progName.includes(q)
      );
    });
  }, [searchTerm, selectedType, selectedRegion, selectedProgramFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-elevation border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Simuler un Candidat (100 profils marocains réels)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  11 Programmes Marocains
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sélectionnez un profil pour injecter automatiquement Demandeur, Projet, Budget & Pièces conformes à chaque programme.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom d'entreprise, ville (Casablanca, Fès...), programme (Istitmar, INDH...), ICE, CIN..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Program Selector */}
            <div className="flex items-center gap-1.5">
              <select
                aria-label="Filtrer par programme"
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">Tous les programmes ({GRANT_PROGRAMS.length})</option>
                {GRANT_PROGRAMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                aria-label="Filtrer par région marocaine"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 outline-none cursor-pointer"
              >
                <option value="all">Toutes les régions ({regionsList.length})</option>
                {regionsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Structure :</span>
            {[
              { id: 'all', label: 'Tous (100)' },
              { id: 'entreprise', label: 'Entreprises' },
              { id: 'association', label: 'Associations' },
              { id: 'autre', label: 'Coopératives' },
              { id: 'independant', label: 'Artisans / Indépendants' },
              { id: 'etablissement_public', label: 'Établissements Publics' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedType === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              {filteredCandidates.length} candidat(s) trouvé(s)
            </span>
          </div>
        </div>

        {/* List of candidates */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredCandidates.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Aucun candidat ne correspond à votre recherche</p>
              <p className="text-xs text-slate-400">Essayez de modifier votre mot-clé ou de réinitialiser les filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedRegion('all');
                  setSelectedProgramFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate, idx) => {
                const isSelected = candidate.id === selectedCandidateId;
                const prog = findProgram(candidate.projet.programme_id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => {
                      onSelectCandidate(candidate);
                      onClose();
                    }}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left group flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-400/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Row: Index & Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                            {candidate.badge}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 capitalize">
                          {candidate.demandeur.structure_type}
                        </span>
                      </div>

                      {/* Structure Name */}
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition-colors line-clamp-1">
                        {candidate.demandeur.nom_ou_raison_sociale}
                      </h3>

                      {/* Tagline */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {candidate.tagline}
                      </p>

                      {/* Program badge */}
                      {prog && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] text-brand-900">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">
                            Dispositif : <strong>{prog.nom}</strong>
                          </span>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {candidate.demandeur.prenom_representant} {candidate.demandeur.nom_representant}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {candidate.demandeur.ville} ({candidate.demandeur.code_postal})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">ICE : </span>
                          <span className="font-mono font-semibold text-slate-700">{candidate.demandeur.siret}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Demande : </span>
                          <span className="font-bold text-emerald-700">{candidate.budget.montant_demande.toLocaleString('fr-FR')} MAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-mono">
                        CIN: {candidate.demandeur.cin_representant} • {candidate.demandeur.date_naissance_representant}
                      </span>
                      <button
                        type="button"
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 group-hover:bg-brand-600 group-hover:text-white text-slate-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Actif
                          </>
                        ) : (
                          <>
                            Charger
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>100 candidats couvrant l'ensemble des 12 régions et les 11 programmes officiels au Maroc.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200/60 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
