import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MoroccanThemeProvider } from './components/moroccan/MoroccanPatterns';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WizardPage } from './pages/WizardPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MoroccanThemeProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-sand-100 text-ink-900 font-sans transition-colors duration-300">
            <Header />

          <main className="flex-1 w-full">
            <Routes>
              {/* 1. Landing Page d'accueil */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Authentification simulée */}
              <Route path="/login" element={<LoginPage />} />

              {/* 3. Dashboard candidat & gestion des pièces manquantes */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* 4. Wizard de candidature existant en 5 étapes */}
              <Route path="/candidature" element={<WizardPage />} />

              {/* Redirection fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </MoroccanThemeProvider>
  </BrowserRouter>
  );
};

export default App;
