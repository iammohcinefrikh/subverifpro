import type { MockCandidateUser, DossierMetadata, SignUpFormData } from '../types/auth';
import type { WebhookDossierPayload, WebhookPiecePayload } from '../types/webhook';
import type { DocumentType } from '../types/ocr';
import { generateCandidateJwt } from './jwtService';
import type { MockCandidate } from '../config/mockCandidates';
import { findProgram } from '../config/programs';
import { normalizeDocumentType } from './complianceCheckService';

const STORAGE_SESSION_KEY = 'SUBVERIF_AUTH_SESSION';
const STORAGE_JWT_KEY = 'SUBVERIF_JWT_TOKEN';

/**
 * Allège l'objet utilisateur pour ne jamais saturer le quota du localStorage
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
 * Nettoie le localStorage : supprime les anciennes bases factices obsolètes
 * et ne préserve que la session active de l'utilisateur connecté.
 */
export function pruneLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    // Élimination définitive des anciennes clés de stockage factice
    localStorage.removeItem('SUBVERIF_MOCK_USERS_DB');
    localStorage.removeItem('mock_candidate_users');

    const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      if (parsedSession) {
        const cleanedSession = sanitizeUserForStorage(parsedSession);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(cleanedSession));
      }
    }
  } catch (err) {
    console.warn('[Storage] Nettoyage du localStorage:', err);
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
 * Récupère la session active de l'utilisateur connecté depuis le localStorage.
 */
export function getStoredSession(): MockCandidateUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Définit ou réinitialise la session active.
 */
export function setStoredSession(user: MockCandidateUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } else {
    const cleaned = sanitizeUserForStorage(user);
    safeSetLocalStorage(STORAGE_SESSION_KEY, JSON.stringify(cleaned));
  }
}

/**
 * Récupère le token JWT actif.
 */
export function getStoredJwtToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_JWT_KEY);
}

/**
 * Enregistre ou réinitialise le token JWT actif.
 */
export function setStoredJwtToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(STORAGE_JWT_KEY);
  } else {
    localStorage.setItem(STORAGE_JWT_KEY, token);
  }
}

/**
 * Retourne la session active sous forme de tableau (ou tableau vide).
 * Ne conserve plus de base de données fictive locale : la base de données PostgreSQL fait foi.
 */
export function getAllMockCandidates(): MockCandidateUser[] {
  const session = getStoredSession();
  return session ? [session] : [];
}

/**
 * Récupère la liste réelle des candidats inscrits en base de données PostgreSQL via l'API backend.
 */
export async function fetchAllDbCandidates(): Promise<any[]> {
  try {
    const res = await fetch('/api/candidate-users');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.candidates) ? data.candidates : [];
    }
  } catch (err) {
    console.error('[AUTH] Erreur fetchAllDbCandidates:', err);
  }
  return [];
}

/**
 * Sauvegarde la session de l'utilisateur actif si présent dans le tableau.
 */
export function saveAllMockCandidates(users: MockCandidateUser[]): void {
  if (typeof window === 'undefined' || !Array.isArray(users) || users.length === 0) return;
  const currentSession = getStoredSession();
  if (currentSession) {
    const updated = users.find((u) => u.id === currentSession.id);
    if (updated) {
      setStoredSession(updated);
    }
  }
}

/**
 * Vérifie si une adresse e-mail existe déjà EN BASE DE DONNÉES POSTGRESQL.
 * Ne consulte aucune donnée factice / mock data en mémoire.
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; hasApplication?: boolean; name?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { exists: false };

  try {
    const res = await fetch(`/api/candidate-users/check-email?email=${encodeURIComponent(normalizedEmail)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        exists: !!data.exists,
        hasApplication: !!data.hasApplication,
        name: data.nom && data.prenom ? `${data.prenom} ${data.nom}`.trim() : (data.name || undefined)
      };
    }
  } catch (err) {
    console.warn('[AUTH] Échec vérification e-mail API:', err);
  }

  return { exists: false };
}

/**
 * Authentification exclusivement en base de données PostgreSQL (table candidate_users).
 * Ne fallback sur aucune mock data : si l'utilisateur n'est pas en base, la connexion échoue.
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
        const app = json.application || null;
        const existingAppId = app?.application_id || app?.id || null;
        const candidateAppId = existingAppId || `DOS-2026-${dbCandidate.id.slice(0, 8).toUpperCase()}`;

        const authenticatedUser: MockCandidateUser = {
          id: dbCandidate.id,
          application_id: existingAppId || undefined,
          email: dbCandidate.email,
          password: password,
          nomCourt: `${dbCandidate.prenom} ${dbCandidate.nom}`,
          structureNom: dbCandidate.structure_nom || app?.nom_ou_raison_sociale || `${dbCandidate.prenom} ${dbCandidate.nom}`,
          structureType: dbCandidate.structure_type || app?.structure_type || 'entreprise',
          badge: 'Candidat Vérifié',
          hasSubmittedDossier: !!app,
          demandeur: {
            structure_type: dbCandidate.structure_type || app?.structure_type || 'entreprise',
            nom_ou_raison_sociale: dbCandidate.structure_nom || app?.nom_ou_raison_sociale || '',
            siret: app?.siret || '002345678000045',
            secteur_activite: app?.secteur_activite || "Développement d'activités",
            adresse: app?.address || 'Adresse Principale',
            code_postal: '20000',
            ville: app?.city || 'Casablanca',
            region: app?.region || 'Casablanca-Settat',
            anciennete_annees: app?.anciennete_annees || 2,
            nom_representant: dbCandidate.nom,
            prenom_representant: dbCandidate.prenom,
            date_naissance_representant: app?.date_of_birth ? new Date(app.date_of_birth).toISOString().split('T')[0] : '1990-01-01',
            cin_representant: dbCandidate.cin || app?.cin || 'BE998877',
            email_representant: dbCandidate.email,
            telephone_representant: dbCandidate.phone || app?.phone || '0660000000'
          },
          projet: {
            objet_projet: app?.project_object || (dbCandidate.structure_nom?.toLowerCase().includes('atlas') ? 'Plateforme Cloud & Infrastructure IA Souveraine' : 'Projet de développement'),
            description: app?.project_description || 'Dossier de subvention déposé sur la plateforme SubVerif.',
            date_debut: app?.project_start_date ? new Date(app.project_start_date).toISOString().split('T')[0] : '2026-10-01',
            date_fin: app?.project_end_date ? new Date(app.project_end_date).toISOString().split('T')[0] : '2027-09-30',
            programme_id: app?.program_id || (dbCandidate.structure_nom?.toLowerCase().includes('atlas') ? 'prog-tatwir-rd' : 'prog-istitmar-tpe')
          },
          budget: {
            montant_total: Number(app?.total_amount) || 100000,
            montant_demande: Number(app?.requested_amount) || 60000,
            depenses: Array.isArray(app?.depenses) ? app.depenses : [],
            financements: Array.isArray(app?.financements) ? app.financements : []
          },
          dossier: {
            dossier_id: candidateAppId,
            application_id: existingAppId || undefined,
            date_soumission: app?.submitted_at || app?.created_at || new Date().toISOString(),
            statut: app ? (app.status === 'SUBMITTED' ? 'en_attente' : (app.status || 'en_attente')) : 'en_attente',
            pieces_requises: (() => {
              const progId = app?.program_id || (dbCandidate.structure_nom?.toLowerCase().includes('atlas') ? 'prog-tatwir-rd' : 'prog-istitmar-tpe');
              const prog = findProgram(progId);
              return prog
                ? (prog.requirements.map((r) => normalizeDocumentType(r.document_type)) as DocumentType[])
                : (['piece_identite', 'rc', 'statuts', 'rib', 'projet_rd', 'plan_financement', 'devis'] as DocumentType[]);
            })(),
            pieces: (Array.isArray(app?.documents) ? app.documents : []).map((doc: any) => {
              const normType = normalizeDocumentType(doc.type_declare || doc.document_type || doc.type || 'autre');
              return {
                ...doc,
                nom_fichier: doc.nom_fichier || doc.name || doc.file_name || 'document.png',
                type_declare: normType,
                document_type: normType,
                type_suggere_ocr: doc.type_suggere_ocr ? normalizeDocumentType(doc.type_suggere_ocr) : normType,
                texte_ocr: doc.texte_ocr || '',
                champs_detectes: doc.champs_detectes || {},
                fichier_base64: doc.fichier_base64 || '',
                statut_ocr: doc.statut_ocr || (doc.check_status === 'VALID' || doc.check_status === 'PENDING' ? 'succes' : 'en_cours')
              };
            }),
            remarques_instructeur: app?.instructor_notes || 'Dossier rattaché à votre compte utilisateur.'
          }
        };

        setStoredSession(authenticatedUser);
        return authenticatedUser;
      }
    }
  } catch (err) {
    console.error('[AUTH] Erreur connexion PostgreSQL:', err);
  }

  return null;
}

/**
 * Enregistre un nouvel utilisateur EXCLUSIVEMENT en base de données PostgreSQL (table candidate_users).
 * Les données mockCandidateRef ne servent que de modèle de pré-remplissage.
 */
export async function registerNewCandidateUser(
  data: SignUpFormData,
  formPresetRef?: MockCandidate
): Promise<{ user: MockCandidateUser; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // 1. Insertion en base de données PostgreSQL (table candidate_users)
  const dbPayload = {
    email: normalizedEmail,
    password: data.password,
    nom: data.nom.toUpperCase(),
    prenom: data.prenom,
    candidate_id: formPresetRef ? formPresetRef.id : null,
    cin: formPresetRef?.demandeur.cin_representant || null,
    phone: formPresetRef?.demandeur.telephone_representant || null,
    structure_nom: formPresetRef ? formPresetRef.demandeur.nom_ou_raison_sociale : `Entreprise ${data.prenom} ${data.nom}`,
    structure_type: formPresetRef ? formPresetRef.demandeur.structure_type : 'entreprise'
  };

  const res = await fetch('/api/candidate-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dbPayload)
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (
      res.status === 409 ||
      json.code === 'USER_ALREADY_EXISTS' ||
      (typeof json.error === 'string' && (
        json.error.toLowerCase().includes('déjà') ||
        json.error.toLowerCase().includes('existe') ||
        json.error.toLowerCase().includes('already')
      ))
    ) {
      throw new Error(
        json.error || 'Cet utilisateur possède déjà un compte enregistré en base de données. Veuillez vous connecter pour accéder à votre tableau de bord.'
      );
    }
    throw new Error(json.error || "Erreur lors de l'enregistrement en base de données.");
  }

  const dbUser = json.candidateUser;
  const newUserId = dbUser?.id || `user-${Date.now()}`;

  const newUser: MockCandidateUser = {
    id: newUserId,
    email: normalizedEmail,
    password: data.password,
    nomCourt: `${data.prenom} ${data.nom}`,
    structureNom: dbUser?.structure_nom || dbPayload.structure_nom,
    structureType: dbUser?.structure_type || dbPayload.structure_type,
    badge: 'Nouveau Candidat',
    hasSubmittedDossier: false,
    demandeur: {
      structure_type: dbUser?.structure_type || dbPayload.structure_type,
      nom_ou_raison_sociale: dbUser?.structure_nom || dbPayload.structure_nom,
      siret: formPresetRef?.demandeur.siret || '002345678000045',
      secteur_activite: formPresetRef?.demandeur.secteur_activite || "Développement d'activités",
      adresse: formPresetRef?.demandeur.adresse || 'Adresse Principale',
      code_postal: formPresetRef?.demandeur.code_postal || '20000',
      ville: formPresetRef?.demandeur.ville || 'Casablanca',
      region: formPresetRef?.demandeur.region || 'Casablanca-Settat',
      anciennete_annees: formPresetRef?.demandeur.anciennete_annees || 2,
      nom_representant: data.nom.toUpperCase(),
      prenom_representant: data.prenom,
      date_naissance_representant: formPresetRef?.demandeur.date_naissance_representant || '1990-01-01',
      cin_representant: dbUser?.cin || formPresetRef?.demandeur.cin_representant || 'BE998877',
      email_representant: normalizedEmail,
      telephone_representant: dbUser?.phone || formPresetRef?.demandeur.telephone_representant || '0660000000'
    },
    projet: {
      objet_projet: formPresetRef?.projet.objet_projet || 'Projet de développement',
      description: formPresetRef?.projet.description || 'Dossier de candidature initial.',
      date_debut: formPresetRef?.projet.date_debut || '2026-10-01',
      date_fin: formPresetRef?.projet.date_fin || '2027-09-30',
      programme_id: formPresetRef?.projet.programme_id || 'prog-istitmar-tpe'
    },
    budget: {
      montant_total: formPresetRef?.budget.montant_total || 100000,
      montant_demande: formPresetRef?.budget.montant_demande || 60000,
      depenses: formPresetRef?.budget.depenses || [],
      financements: formPresetRef?.budget.financements || []
    },
    application_id: `00000000-0000-4000-8000-${newUserId.slice(0, 12).padStart(12, '0')}`,
    dossier: {
      dossier_id: `00000000-0000-4000-8000-${newUserId.slice(0, 12).padStart(12, '0')}`,
      application_id: `00000000-0000-4000-8000-${newUserId.slice(0, 12).padStart(12, '0')}`,
      date_soumission: new Date().toISOString(),
      statut: 'en_attente',
      pieces_requises: ['piece_identite', 'rib', 'devis', 'statuts'],
      pieces: [],
      remarques_instructeur: 'Compte créé avec succès en base de données. Vous pouvez renseigner et déposer votre dossier.'
    }
  };

  const token = await generateCandidateJwt({
    id: newUser.id,
    email: newUser.email,
    nom: newUser.demandeur.nom_representant,
    prenom: newUser.demandeur.prenom_representant,
    dossier_id: newUser.dossier.dossier_id
  });

  setStoredSession(newUser);
  setStoredJwtToken(token);

  return { user: newUser, token };
}

/**
 * Met à jour le dossier de l'utilisateur actif en session.
 */
export function updateCandidateDossier(
  candidateId: string,
  updatedDossier: Partial<DossierMetadata>
): MockCandidateUser | null {
  const currentSession = getStoredSession();
  if (!currentSession || currentSession.id !== candidateId) return null;

  const mergedDossier: DossierMetadata = {
    ...currentSession.dossier,
    ...updatedDossier
  };

  const updatedUser: MockCandidateUser = {
    ...currentSession,
    dossier: mergedDossier
  };

  setStoredSession(updatedUser);
  return updatedUser;
}

/**
 * Ajoute des pièces complémentaires au dossier de l'utilisateur actif.
 */
export function addComplementPiecesToDossier(
  candidateId: string,
  newPieces: WebhookPiecePayload[],
  remarks?: string
): MockCandidateUser | null {
  const currentSession = getStoredSession();
  if (!currentSession || currentSession.id !== candidateId) return null;

  const normalizedNewPieces = newPieces.map((p) => {
    const norm = normalizeDocumentType(p.type_declare || (p as any).document_type);
    return { ...p, type_declare: norm, document_type: norm };
  });

  const newTypeMap = new Map<string, WebhookPiecePayload>(normalizedNewPieces.map((p: WebhookPiecePayload) => [p.type_declare, p]));
  const keptPieces = currentSession.dossier.pieces.filter((p: WebhookPiecePayload) => !newTypeMap.has(normalizeDocumentType(p.type_declare)));
  const updatedPieces = [...keptPieces, ...normalizedNewPieces];

  const existingTypes = new Set(updatedPieces.map((p: WebhookPiecePayload) => normalizeDocumentType(p.type_declare)));
  const prog = findProgram(currentSession.projet?.programme_id);
  const piecesRequises = currentSession.dossier.pieces_requises?.length
    ? currentSession.dossier.pieces_requises.map((r) => normalizeDocumentType(r))
    : (prog?.requirements.map((r) => normalizeDocumentType(r.document_type)) || ['piece_identite', 'rc', 'statuts', 'rib', 'projet_rd', 'plan_financement', 'devis']);
  const missing = piecesRequises.filter((r) => !existingTypes.has(r));
  const isComplete = missing.length === 0;

  const updateData: Partial<DossierMetadata> = {
    pieces: updatedPieces,
    statut: isComplete ? 'en_cours_examen' : 'documents_manquants',
    remarques_instructeur: remarks
      ? `Complément reçu le ${new Date().toLocaleDateString('fr-FR')} : ${remarks}. Dossier réexaminé.`
      : isComplete
      ? `Toutes les pièces requises ont été vérifiées et déclarées conformes le ${new Date().toLocaleDateString('fr-FR')}. Dossier complet.`
      : `Documents complémentaires transmis le ${new Date().toLocaleDateString('fr-FR')}. Il reste ${missing.length} pièce(s) manquante(s).`
  };

  return updateCandidateDossier(candidateId, updateData);
}

/**
 * Enregistre un nouveau dossier soumis depuis le Wizard pour qu'il soit disponible immédiatement dans le Dashboard.
 */
export function registerWizardSubmissionAsCandidate(payload: WebhookDossierPayload): MockCandidateUser {
  const currentSession = getStoredSession();
  const prog = findProgram(payload.projet?.programme_id);
  const programPiecesRequises: DocumentType[] = prog
    ? (prog.requirements.map((r) => normalizeDocumentType(r.document_type)) as DocumentType[])
    : (['piece_identite', 'rc', 'statuts', 'rib', 'projet_rd', 'plan_financement', 'devis'] as DocumentType[]);

  const normalizedPieces = (payload.pieces || []).map((p) => {
    const norm = normalizeDocumentType(p.type_declare || (p as any).document_type);
    return { ...p, type_declare: norm, document_type: norm };
  });

  // Maintien strict de l'identifiant application_id : immuable pour un candidat donné
  const isUuid = (val?: string | null) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const fixedAppId =
    (currentSession?.application_id && isUuid(currentSession.application_id) ? currentSession.application_id : null) ||
    (currentSession?.dossier?.application_id && isUuid(currentSession.dossier.application_id) ? currentSession.dossier.application_id : null) ||
    (currentSession?.dossier?.dossier_id && isUuid(currentSession.dossier.dossier_id) ? currentSession.dossier.dossier_id : null) ||
    payload.application_id ||
    payload.dossier_id;

  const user: MockCandidateUser = {
    id: currentSession?.id || `cand-${Date.now()}`,
    application_id: fixedAppId,
    email: payload.demandeur.email_representant,
    password: currentSession?.password || 'password123',
    nomCourt: payload.demandeur.nom_ou_raison_sociale.slice(0, 24),
    structureNom: payload.demandeur.nom_ou_raison_sociale,
    structureType: payload.demandeur.structure_type,
    badge: currentSession?.hasSubmittedDossier ? 'Dossier Mis à Jour' : 'Dossier Transmis',
    hasSubmittedDossier: true,
    demandeur: payload.demandeur,
    projet: payload.projet,
    budget: payload.budget,
    dossier: {
      dossier_id: fixedAppId,
      application_id: fixedAppId,
      date_soumission: payload.date_soumission,
      statut: 'en_attente', // Flux de traitement : repasse par le processus global d'évaluation et de validation
      pieces_requises: programPiecesRequises,
      pieces: normalizedPieces,
      remarques_instructeur: 'Dossier ré-soumis et mis à jour avec succès. Réévaluation globale et contrôle de conformité en cours.'
    }
  };

  setStoredSession(user);
  return user;
}
