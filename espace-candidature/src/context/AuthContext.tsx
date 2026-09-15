import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { MockCandidateUser, SignUpFormData } from '../types/auth';
import {
  getStoredSession,
  setStoredSession,
  getStoredJwtToken,
  setStoredJwtToken,
  verifyCredentialsAsync,
  registerNewCandidateUser,
  fetchAllDbCandidates
} from '../services/mockAuthService';
import { generateCandidateJwt } from '../services/jwtService';
import type { MockCandidate } from '../config/mockCandidates';

export interface AuthContextType {
  user: MockCandidateUser | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (formData: SignUpFormData, mockCandidateRef?: MockCandidate) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (candidateIdOrEmail?: string) => Promise<MockCandidateUser>;
  logout: () => void;
  refreshUser: () => void;
  availableDemoCandidates: MockCandidateUser[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockCandidateUser | null>(() => getStoredSession());
  const [jwtToken, setJwtToken] = useState<string | null>(() => getStoredJwtToken());
  const [dbCandidates, setDbCandidates] = useState<any[]>([]);

  // Charge la liste réelle des utilisateurs inscrits en base PostgreSQL
  const loadDbCandidates = useCallback(async () => {
    const list = await fetchAllDbCandidates();
    setDbCandidates(list);
  }, []);

  useEffect(() => {
    loadDbCandidates();
  }, [loadDbCandidates]);

  const refreshUser = useCallback(() => {
    const session = getStoredSession();
    setUser(session);
    setJwtToken(getStoredJwtToken());
    loadDbCandidates();
  }, [loadDbCandidates]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const matched = await verifyCredentialsAsync(email, password);
    if (!matched) {
      return {
        success: false,
        error: 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.'
      };
    }

    const token = await generateCandidateJwt({
      id: matched.id,
      email: matched.email,
      nom: matched.demandeur.nom_representant,
      prenom: matched.demandeur.prenom_representant,
      dossier_id: matched.dossier.dossier_id
    });

    setUser(matched);
    setJwtToken(token);
    setStoredSession(matched);
    setStoredJwtToken(token);
    loadDbCandidates();

    return { success: true };
  };

  const signUp = async (
    formData: SignUpFormData,
    mockCandidateRef?: MockCandidate
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: newUser, token } = await registerNewCandidateUser(formData, mockCandidateRef);
      setUser(newUser);
      setJwtToken(token);
      loadDbCandidates();
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erreur lors de la création du compte.'
      };
    }
  };

  /**
   * Connexion avec un compte existant en base de données PostgreSQL
   */
  const loginAsDemo = async (candidateIdOrEmail?: string): Promise<MockCandidateUser> => {
    let email = 'amina@bio-atlas.ma';

    if (candidateIdOrEmail) {
      if (candidateIdOrEmail.includes('@')) {
        email = candidateIdOrEmail;
      } else {
        const found = dbCandidates.find((c) => c.id === candidateIdOrEmail || c.candidate_id === candidateIdOrEmail);
        if (found?.email) {
          email = found.email;
        }
      }
    } else if (dbCandidates.length > 0) {
      email = dbCandidates[0].email;
    }

    const res = await login(email, 'password123');
    if (res.success && getStoredSession()) {
      return getStoredSession()!;
    }
    throw new Error(res.error || 'Impossible de se connecter au profil démo.');
  };

  const logout = () => {
    setUser(null);
    setJwtToken(null);
    setStoredSession(null);
    setStoredJwtToken(null);
  };

  // Les candidats disponibles proviennent exclusivement de la base PostgreSQL
  const availableDemoCandidates = useMemo(() => {
    return dbCandidates.map((c) => ({
      id: c.id,
      email: c.email,
      password: 'password123',
      nomCourt: `${c.prenom || ''} ${c.nom || ''}`.trim() || c.email,
      structureNom: c.structure_nom || `${c.prenom || ''} ${c.nom || ''}`.trim(),
      structureType: c.structure_type || 'entreprise',
      badge: 'Candidat Vérifié',
      hasSubmittedDossier: !!c.application_id,
      demandeur: {
        nom_representant: c.nom || '',
        prenom_representant: c.prenom || '',
        email_representant: c.email,
        structure_type: c.structure_type || 'entreprise',
        nom_ou_raison_sociale: c.structure_nom || '',
        cin_representant: c.cin || '',
        telephone_representant: c.phone || '',
        siret: '',
        secteur_activite: '',
        adresse: '',
        code_postal: '',
        ville: '',
        region: '',
        anciennete_annees: 0,
        date_naissance_representant: '1990-01-01'
      },
      projet: {
        objet_projet: 'Dossier de subvention',
        description: '',
        date_debut: '',
        date_fin: '',
        programme_id: 'prog-istitmar-tpe'
      },
      budget: {
        montant_total: 0,
        montant_demande: 0,
        depenses: [],
        financements: []
      },
      dossier: {
        dossier_id: c.application_id || `DOS-${c.id.slice(0, 8)}`,
        date_soumission: c.created_at || new Date().toISOString(),
        statut: c.application_status === 'SUBMITTED' ? 'en_attente' : (c.application_status || 'en_attente'),
        pieces_requises: ['piece_identite', 'rib', 'devis', 'statuts'],
        pieces: []
      }
    } as MockCandidateUser));
  }, [dbCandidates]);

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        isAuthenticated: !!user,
        login,
        signUp,
        loginAsDemo,
        logout,
        refreshUser,
        availableDemoCandidates
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
