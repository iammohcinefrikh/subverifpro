import React, { createContext, useState, useCallback } from 'react';
import type { MockCandidateUser, SignUpFormData } from '../types/auth';
import {
  getStoredSession,
  setStoredSession,
  getStoredJwtToken,
  setStoredJwtToken,
  verifyCredentialsAsync,
  getAllMockCandidates,
  registerNewCandidateUser
} from '../services/mockAuthService';
import { generateCandidateJwt } from '../services/jwtService';

import type { MockCandidate } from '../config/mockCandidates';

export interface AuthContextType {
  user: MockCandidateUser | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (formData: SignUpFormData, mockCandidateRef?: MockCandidate) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (candidateId?: string) => Promise<MockCandidateUser>;
  logout: () => void;
  refreshUser: () => void;
  availableDemoCandidates: MockCandidateUser[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockCandidateUser | null>(() => getStoredSession());
  const [jwtToken, setJwtToken] = useState<string | null>(() => getStoredJwtToken());
  const [availableDemoCandidates, setAvailableDemoCandidates] = useState<MockCandidateUser[]>(() =>
    getAllMockCandidates()
  );

  const refreshUser = useCallback(() => {
    const all = getAllMockCandidates();
    setAvailableDemoCandidates(all);
    const session = getStoredSession();
    if (session) {
      const upToDate = all.find((u) => u.id === session.id) || session;
      setUser(upToDate);
      setStoredSession(upToDate);
    } else {
      setUser(null);
    }
    setJwtToken(getStoredJwtToken());
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const matched = await verifyCredentialsAsync(email, password);
    if (!matched) {
      return {
        success: false,
        error: 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.'
      };
    }

    // Génération du JWT lors de la connexion
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
      setAvailableDemoCandidates(getAllMockCandidates());
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erreur lors de la création du compte.'
      };
    }
  };

  const loginAsDemo = async (candidateId?: string): Promise<MockCandidateUser> => {
    const all = getAllMockCandidates();
    let target: MockCandidateUser | undefined;

    if (candidateId) {
      target = all.find((u) => u.id === candidateId);
    }

    if (!target) {
      target = all.find((u) => u.dossier.statut === 'documents_manquants') || all[0];
    }

    const token = await generateCandidateJwt({
      id: target.id,
      email: target.email,
      nom: target.demandeur.nom_representant,
      prenom: target.demandeur.prenom_representant,
      dossier_id: target.dossier.dossier_id
    });

    setUser(target);
    setJwtToken(token);
    setStoredSession(target);
    setStoredJwtToken(token);

    return target;
  };

  const logout = () => {
    setUser(null);
    setJwtToken(null);
    setStoredSession(null);
    setStoredJwtToken(null);
  };

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
