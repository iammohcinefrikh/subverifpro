import type { MockCandidateUser, DossierMetadata, SignUpFormData } from '../types/auth';
import type { WebhookDossierPayload, WebhookPiecePayload } from '../types/webhook';
import { INITIAL_MOCK_USERS } from '../config/candidateAuthStore';
import { generateCandidateJwt } from './jwtService';

const STORAGE_USERS_KEY = 'SUBVERIF_MOCK_USERS_DB';
const STORAGE_SESSION_KEY = 'SUBVERIF_AUTH_SESSION';
const STORAGE_JWT_KEY = 'SUBVERIF_JWT_TOKEN';

/**
 * Allège l'objet utilisateur pour ne jamais saturer le quota de 5 Mo du localStorage
 * en éliminant les volumineuses chaînes base64 des fichiers numérisés.
 */
export function sanitizeUserForStorage(user: MockCandidateUser): MockCandidateUser {
  if (!user) return user;
  if (!user.dossier || !Array.isArray(user.dossier.pieces)) return user;

  return {
    ...user,
    dossier: {
      ...user.dossier,
      pieces: user.dossier.pieces.map((p) => {
        if (p.fichier_base64 && p.fichier_base64.length > 100) {
          const { fichier_base64, ...rest } = p;
          return { ...rest, fichier_base64: '' };
        }
        return p;
      })
    }
  };
}

/**
 * Nettoie le localStorage des données base64 excédentaires pour libérer immédiatement le quota.
 */
export function pruneLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map(sanitizeUserForStorage);
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cleaned));
      }
    }
    const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      if (parsedSession) {
        const cleanedSession = sanitizeUserForStorage(parsedSession);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(cleanedSession));
      }
    }
  } catch (err) {
    console.warn('[Storage] Nettoyage automatique du localStorage:', err);
  }
}

// Purge préventive immédiate au chargement du module
if (typeof window !== 'undefined') {
  try {
    pruneLocalStorage();
  } catch {}
}

/**
 * Sauvegarde sécurisée dans le localStorage gérant QuotaExceededError
 */
export function safeSetLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014) {
      console.warn(`[Storage] Quota dépassé sur "${key}". Nettoyage d'urgence...`);
      pruneLocalStorage();
      try {
        localStorage.setItem(key, value);
      } catch (retryErr) {
        console.error(`[Storage] Échec après nettoyage d'urgence:`, retryErr);
      }
    } else {
      console.error(`[Storage] Erreur écriture "${key}":`, err);
    }
  }
}

/**
 * Récupère l'ensemble des candidats mockés depuis le localStorage (ou initialise la base).
 */
export function getAllMockCandidates(): MockCandidateUser[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_USERS;

  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      safeSetLocalStorage(STORAGE_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Erreur lecture candidats localStorage:', err);
  }

  return INITIAL_MOCK_USERS;
}

/**
 * Sauvegarde la liste complète des candidats dans le localStorage.
 */
export function saveAllMockCandidates(users: MockCandidateUser[]): void {
  if (typeof window === 'undefined') return;
  const cleaned = users.map(sanitizeUserForStorage);
  safeSetLocalStorage(STORAGE_USERS_KEY, JSON.stringify(cleaned));
}

/**
 * Authentification synchrone locale par email et mot de passe (fallback).
 */
export function verifyCredentials(email: string, password: string): MockCandidateUser | null {
  const users = getAllMockCandidates();
  const normalizedEmail = email.trim().toLowerCase();

  const matched = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  return matched || null;
}

/**
 * Authentification asynchrone vérifiant le mot de passe hashé en base de données PostgreSQL.
 */
export async function verifyCredentialsAsync(email: string, password: string): Promise<MockCandidateUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch('/api/candidate-users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.candidateUser) {
        const dbCandidate = json.candidateUser;
        const users = getAllMockCandidates();
        const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (existing) {
          existing.id = dbCandidate.id;
          saveAllMockCandidates(users);
          return existing;
        }

        const newUser: MockCandidateUser = {
          id: dbCandidate.id,
          email: dbCandidate.email,
          password: password,
          nomCourt: `${dbCandidate.prenom} ${dbCandidate.nom}`,
          structureNom: dbCandidate.structure_nom || `${dbCandidate.prenom} ${dbCandidate.nom}`,
          structureType: dbCandidate.structure_type || 'entreprise',
          badge: 'Candidat Vérifié',
          demandeur: {
            structure_type: dbCandidate.structure_type || 'entreprise',
            nom_ou_raison_sociale: dbCandidate.structure_nom || '',
            siret: '002345678000045',
            secteur_activite: "Développement d'activités",
            adresse: 'Adresse Principale',
            code_postal: '20000',
            ville: 'Casablanca',
            region: 'Casablanca-Settat',
            anciennete_annees: 2,
            nom_representant: dbCandidate.nom,
            prenom_representant: dbCandidate.prenom,
            date_naissance_representant: '1990-01-01',
            cin_representant: dbCandidate.cin || 'BE998877',
            email_representant: dbCandidate.email,
            telephone_representant: dbCandidate.phone || '0660000000'
          },
          projet: {
            objet_projet: 'Projet de développement',
            description: 'Dossier de subvention déposé sur la plateforme SubVerif.',
            date_debut: '2026-10-01',
            date_fin: '2027-09-30',
            programme_id: 'prog-istitmar-tpe'
          },
          budget: {
            montant_total: 100000,
            montant_demande: 60000,
            depenses: [],
            financements: []
          },
          dossier: {
            dossier_id: `DOS-2026-${dbCandidate.id.slice(0, 8).toUpperCase()}`,
            date_soumission: new Date().toISOString(),
            statut: 'en_attente',
            pieces_requises: ['piece_identite', 'rib', 'devis', 'statuts'],
            remarques_instructeur: "Dossier en cours d'instruction.",
            pieces: []
          }
        };

        users.unshift(newUser);
        saveAllMockCandidates(users);
        return newUser;
      }
    }
  } catch (err) {
    console.warn('[AUTH] Connexion base échouée, fallback local:', err);
  }

  return verifyCredentials(email, password);
}

/**
 * Récupère la session courante depuis le localStorage.
 */
export function getStoredSession(): MockCandidateUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockCandidateUser;
  } catch {
    return null;
  }
}

/**
 * Enregistre la session active.
 */
export function setStoredSession(user: MockCandidateUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } else {
    const cleanUser = sanitizeUserForStorage(user);
    safeSetLocalStorage(STORAGE_SESSION_KEY, JSON.stringify(cleanUser));
  }
}

/**
 * Récupère le token JWT actif depuis le localStorage.
 */
export function getStoredJwtToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_JWT_KEY);
}

/**
 * Enregistre le token JWT actif.
 */
export function setStoredJwtToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(STORAGE_JWT_KEY);
  } else {
    localStorage.setItem(STORAGE_JWT_KEY, token);
  }
}

import { MOCK_CANDIDATES } from '../config/mockCandidates';
import type { MockCandidate } from '../config/mockCandidates';

/**
 * Enregistre un nouvel utilisateur via le formulaire Sign Up,
 * synchronise avec les données de MOCK_CANDIDATES si disponible,
 * génère son JWT signé et l'initialise dans le système.
 */
export async function registerNewCandidateUser(
  data: SignUpFormData,
  mockCandidateRef?: MockCandidate
): Promise<{ user: MockCandidateUser; token: string }> {
  const users = getAllMockCandidates();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Chercher si ce candidat existe dans MOCK_CANDIDATES du flux de soumission
  const matchedMock = mockCandidateRef || MOCK_CANDIDATES.find(
    (c) => c.demandeur.email_representant.toLowerCase() === normalizedEmail
  );

  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  // 1. Insertion en base de données PostgreSQL (table candidate_users)
  let dbUserId: string | null = null;
  try {
    const dbPayload = {
      email: normalizedEmail,
      password: data.password,
      nom: data.nom.toUpperCase(),
      prenom: data.prenom,
      candidate_id: matchedMock ? matchedMock.id : null,
      cin: matchedMock?.demandeur.cin_representant || 'BE998877',
      phone: matchedMock?.demandeur.telephone_representant || '0660000000',
      structure_nom: matchedMock ? matchedMock.demandeur.nom_ou_raison_sociale : `Entreprise ${data.prenom} ${data.nom}`,
      structure_type: matchedMock ? matchedMock.demandeur.structure_type : 'entreprise'
    };

    const res = await fetch('/api/candidate-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbPayload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.candidateUser?.id) {
        dbUserId = json.candidateUser.id;
        console.log('[DB] Utilisateur candidat créé avec succès dans candidate_users:', json.candidateUser);
      }
    }
  } catch (dbErr) {
    console.warn('[DB] Fallback local, impossible de joindre /api/candidate-users:', dbErr);
  }

  const newId = dbUserId || (matchedMock ? matchedMock.id : `cand-user-${Date.now()}`);
  const dossierId = matchedMock
    ? `DOS-2026-${matchedMock.nomCourt.replace(/\s+/g, '-').slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    : `DOS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const newUser: MockCandidateUser = {
    id: newId,
    email: normalizedEmail,
    password: data.password,
    nomCourt: matchedMock ? matchedMock.nomCourt : `${data.prenom.toUpperCase()} ${data.nom.toUpperCase()}`,
    structureNom: matchedMock ? matchedMock.demandeur.nom_ou_raison_sociale : `Entreprise ${data.prenom} ${data.nom}`,
    structureType: matchedMock ? matchedMock.demandeur.structure_type : 'entreprise',
    badge: matchedMock ? matchedMock.badge : 'Nouveau Candidat',
    demandeur: matchedMock
      ? {
          ...matchedMock.demandeur,
          nom_representant: data.nom.toUpperCase(),
          prenom_representant: data.prenom,
          email_representant: normalizedEmail
        }
      : {
          structure_type: 'entreprise',
          nom_ou_raison_sociale: `Entreprise ${data.prenom} ${data.nom}`,
          siret: '003123456000088',
          secteur_activite: 'Développement d\'activités & Innovation',
          adresse: 'Boulevard Principal, Centre d\'Affaires',
          code_postal: '20000',
          ville: 'Casablanca',
          region: 'Casablanca-Settat',
          anciennete_annees: 1,
          nom_representant: data.nom.toUpperCase(),
          prenom_representant: data.prenom,
          date_naissance_representant: '1990-01-01',
          cin_representant: 'BE998877',
          email_representant: normalizedEmail,
          telephone_representant: '0660000000'
        },
    projet: matchedMock ? matchedMock.projet : {
      objet_projet: 'Projet de développement et équipement professionnel',
      description: 'Projet déposé via la plateforme SubVerif nécessitant un cofinancement sous forme de subvention d\'investissement.',
      date_debut: '2026-11-01',
      date_fin: '2027-10-31',
      programme_id: 'prog-istitmar-tpe'
    },
    budget: matchedMock ? matchedMock.budget : {
      montant_total: 100000,
      montant_demande: 60000,
      depenses: [
        { id: 'dep-init-1', libelle: 'Acquisition équipement de production', montant: 60000 },
        { id: 'dep-init-2', libelle: 'Frais d\'installation et formation', montant: 40000 }
      ],
      financements: [
        { id: 'fin-init-1', financeur: 'Subvention sollicitée', montant: 60000, statut: 'sollicite' },
        { id: 'fin-init-2', financeur: 'Apport propre', montant: 40000, statut: 'acquis' }
      ]
    },
    dossier: {
      dossier_id: dossierId,
      date_soumission: new Date().toISOString(),
      statut: 'en_attente',
      pieces_requises: ['piece_identite', 'rib', 'devis', 'statuts'],
      remarques_instructeur: 'Compte initialisé. Complétez et soumettez votre dossier via le parcours de candidature.',
      pieces: []
    },
    hasSubmittedDossier: false
  };

  // Génération du JWT signé
  const token = await generateCandidateJwt({
    id: newUser.id,
    email: newUser.email,
    nom: data.nom,
    prenom: data.prenom,
    dossier_id: dossierId
  });

  if (existingIndex >= 0) {
    users[existingIndex] = newUser;
  } else {
    users.unshift(newUser);
  }

  saveAllMockCandidates(users);
  setStoredSession(newUser);
  setStoredJwtToken(token);

  return { user: newUser, token };
}

/**
 * Met à jour le dossier d'un candidat spécifique (par exemple après ajout de pièces manquantes).
 */
export function updateCandidateDossier(
  candidateId: string,
  updatedDossier: Partial<DossierMetadata>
): MockCandidateUser | null {
  const users = getAllMockCandidates();
  const index = users.findIndex((u) => u.id === candidateId);

  if (index === -1) return null;

  const target = users[index];
  const mergedDossier: DossierMetadata = {
    ...target.dossier,
    ...updatedDossier
  };

  const updatedUser: MockCandidateUser = {
    ...target,
    dossier: mergedDossier
  };

  users[index] = updatedUser;
  saveAllMockCandidates(users);

  // Mettre à jour la session si c'est l'utilisateur actif
  const currentSession = getStoredSession();
  if (currentSession && currentSession.id === candidateId) {
    setStoredSession(updatedUser);
  }

  return updatedUser;
}

/**
 * Ajoute des pièces complémentaires au dossier et passe automatiquement le statut à 'en_cours_examen'.
 */
export function addComplementPiecesToDossier(
  candidateId: string,
  newPieces: WebhookPiecePayload[],
  remarks?: string
): MockCandidateUser | null {
  const users = getAllMockCandidates();
  const target = users.find((u) => u.id === candidateId);
  if (!target) return null;

  // Remplacer les pièces existantes de même type ou ajouter les nouvelles
  const newTypeMap = new Map<string, WebhookPiecePayload>(newPieces.map((p: WebhookPiecePayload) => [p.type_declare, p]));
  const keptPieces = target.dossier.pieces.filter((p: WebhookPiecePayload) => !newTypeMap.has(p.type_declare));
  const updatedPieces = [...keptPieces, ...newPieces];

  const existingTypes = new Set(updatedPieces.map((p: WebhookPiecePayload) => p.type_declare));
  const piecesRequises = target.dossier.pieces_requises || ['piece_identite', 'rib', 'devis', 'statuts'];
  const missing = piecesRequises.filter((r) => !existingTypes.has(r));
  const isComplete = missing.length === 0;

  const updateData: Partial<DossierMetadata> = {
    pieces: updatedPieces,
    statut: isComplete ? 'en_cours_examen' : 'documents_manquants',
    remarques_instructeur: remarks
      ? `Complément reçu le ${new Date().toLocaleDateString('fr-FR')} : ${remarks}. Dossier réexaminé par l'instructeur.`
      : isComplete
      ? `Toutes les pièces requises ont été vérifiées et déclarées conformes le ${new Date().toLocaleDateString('fr-FR')}. Dossier transmis pour examen en commission.`
      : `Documents complémentaires transmis le ${new Date().toLocaleDateString('fr-FR')}. Il reste ${missing.length} pièce(s) manquante(s).`
  };

  return updateCandidateDossier(candidateId, updateData);
}

/**
 * Enregistre un nouveau dossier soumis depuis le Wizard pour qu'il soit disponible immédiatement dans le Dashboard.
 */
export function registerWizardSubmissionAsCandidate(payload: WebhookDossierPayload): MockCandidateUser {
  const users = getAllMockCandidates();

  const newId = `user-${Date.now()}`;
  const newUser: MockCandidateUser = {
    id: newId,
    email: payload.demandeur.email_representant,
    password: 'password123',
    nomCourt: payload.demandeur.nom_ou_raison_sociale.slice(0, 24),
    structureNom: payload.demandeur.nom_ou_raison_sociale,
    structureType: payload.demandeur.structure_type,
    badge: 'Nouveau Dépôt',
    demandeur: payload.demandeur,
    projet: payload.projet,
    budget: payload.budget,
    dossier: {
      dossier_id: payload.dossier_id,
      date_soumission: payload.date_soumission,
      statut: 'en_attente',
      pieces_requises: ['piece_identite', 'rib', 'devis', 'statuts'],
      remarques_instructeur: 'Votre dossier complet a été réceptionné par nos services. Il sera assigné à un instructeur sous 48h.',
      pieces: payload.pieces
    },
    hasSubmittedDossier: true
  };

  users.unshift(newUser);
  saveAllMockCandidates(users);

  return newUser;
}
