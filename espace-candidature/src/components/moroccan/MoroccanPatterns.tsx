import React, { createContext, useContext, useState, useEffect } from 'react';

/* --------------------------------------------------------------------------
   Thèmes Régionaux Marocains : Atlas/Safi (Terracotta) vs Fès (Bleu Cobalt)
-------------------------------------------------------------------------- */
export type MoroccanTheme = 'atlas' | 'fes';

interface MoroccanThemeContextType {
  theme: MoroccanTheme;
  setTheme: (theme: MoroccanTheme) => void;
  toggleTheme: () => void;
  primaryColor: string;
  primaryDark: string;
  accentColor: string;
  isFes: boolean;
}

const MoroccanThemeContext = createContext<MoroccanThemeContextType>({
  theme: 'atlas',
  setTheme: () => {},
  toggleTheme: () => {},
  primaryColor: '#C1440E',
  primaryDark: '#8F3209',
  accentColor: '#C9962E',
  isFes: false,
});

export const MoroccanThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<MoroccanTheme>(() => {
    try {
      const saved = localStorage.getItem('subverif_theme');
      return (saved === 'fes' ? 'fes' : 'atlas') as MoroccanTheme;
    } catch {
      return 'atlas';
    }
  });

  const setTheme = (newTheme: MoroccanTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('subverif_theme', newTheme);
    } catch {}
    if (newTheme === 'fes') {
      document.documentElement.setAttribute('data-theme', 'fes');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'atlas' ? 'fes' : 'atlas');
  };

  useEffect(() => {
    if (theme === 'fes') {
      document.documentElement.setAttribute('data-theme', 'fes');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const isFes = theme === 'fes';
  const primaryColor = isFes ? '#1E4F8C' : '#C1440E';
  const primaryDark = isFes ? '#123056' : '#8F3209';
  const accentColor = '#C9962E';

  return (
    <MoroccanThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, primaryColor, primaryDark, accentColor, isFes }}
    >
      {children}
    </MoroccanThemeContext.Provider>
  );
};

export const useMoroccanTheme = () => useContext(MoroccanThemeContext);

/* --------------------------------------------------------------------------
   1. Sceau Khatem — Étoile à 8 branches (Symbole d'artisanat géométrique)
-------------------------------------------------------------------------- */
export const KhatemSeal: React.FC<{
  size?: number;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}> = ({
  size = 28,
  className = '',
  fill = '#FAF5EC',
  stroke = '#C1440E',
  strokeWidth = 1.6,
}) => {
  const { primaryColor } = useMoroccanTheme();
  const effectiveStroke = stroke === '#C1440E' ? primaryColor : stroke;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Carré incliné à 45° */}
      <rect
        x="2"
        y="2"
        width="24"
        height="24"
        transform="rotate(45 14 14)"
        fill={fill}
        stroke={effectiveStroke}
        strokeWidth={strokeWidth}
      />
      {/* Carré droit */}
      <rect
        x="3.2"
        y="3.2"
        width="21.6"
        height="21.6"
        fill="none"
        stroke={effectiveStroke}
        strokeWidth={strokeWidth * 0.8}
        opacity={0.7}
      />
      {/* Centre médaillon cuivre/or */}
      <circle cx="14" cy="14" r="4.5" fill="#C9962E" />
      <circle cx="14" cy="14" r="2" fill="#FAF5EC" />
    </svg>
  );
};

/* --------------------------------------------------------------------------
   2. Motif Zellige — Trame géométrique à 8 branches en filigrane discret
-------------------------------------------------------------------------- */
export const ZelligePattern: React.FC<{
  id: string;
  color?: string;
  opacity?: number;
  patternSize?: number;
  className?: string;
}> = ({
  id,
  color,
  opacity = 0.05,
  patternSize = 72,
  className = 'absolute inset-0 w-full h-full pointer-events-none overflow-hidden',
}) => {
  const { primaryColor } = useMoroccanTheme();
  const patternColor = color || primaryColor;

  return (
    <svg
      className={className}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width={patternSize} height={patternSize} patternUnits="userSpaceOnUse">
          <g stroke={patternColor} strokeWidth="1.1" fill="none" opacity={opacity}>
            {/* Étoile à 8 branches : double carré croisé */}
            <rect
              x={patternSize * 0.083}
              y={patternSize * 0.083}
              width={patternSize * 0.833}
              height={patternSize * 0.833}
              transform={`rotate(45 ${patternSize / 2} ${patternSize / 2})`}
            />
            <rect
              x={patternSize * 0.083}
              y={patternSize * 0.083}
              width={patternSize * 0.833}
              height={patternSize * 0.833}
            />
            <circle cx={patternSize / 2} cy={patternSize / 2} r={patternSize * 0.194} />
            <circle cx={patternSize / 2} cy={patternSize / 2} r={patternSize * 0.083} />
            {/* Lignes de pavage et de symétrie */}
            <line x1="0" y1="0" x2={patternSize} y2={patternSize} strokeDasharray="2 3" opacity={0.5} />
            <line x1={patternSize} y1="0" x2="0" y2={patternSize} strokeDasharray="2 3" opacity={0.5} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

/* --------------------------------------------------------------------------
   3. Frise Géométrique — Séparateur de section ciselé
-------------------------------------------------------------------------- */
export const Frieze: React.FC<{
  color?: string;
  className?: string;
  height?: number;
}> = ({ color = '#C9962E', className = 'w-full', height = 12 }) => {
  return (
    <svg
      viewBox="0 0 240 12"
      preserveAspectRatio="none"
      className={className}
      style={{ height }}
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="1" opacity={0.85}>
        {Array.from({ length: 20 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 12} 12 L${i * 12 + 6} 0 L${i * 12 + 12} 12 M${i * 12 + 6} 0 L${i * 12 + 6} 12`}
          />
        ))}
      </g>
    </svg>
  );
};

/* --------------------------------------------------------------------------
   4. Panneau "Bab" — Encadrement monumental en arche outrepassée
-------------------------------------------------------------------------- */
export const BabPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  accentColor?: string;
  themeType?: 'dark' | 'light';
}> = ({
  children,
  className = '',
  innerClassName = '',
  accentColor = '#C9962E',
  themeType = 'dark',
}) => {
  const { primaryColor } = useMoroccanTheme();

  return (
    <div
      className={`relative p-1.5 transition-all ${className}`}
      style={{
        background: `linear-gradient(165deg, ${accentColor} 0%, ${primaryColor} 100%)`,
        borderRadius: '999px 999px 22px 22px',
        boxShadow: '0 20px 40px -15px rgba(26, 43, 76, 0.35)',
      }}
    >
      <div
        className={`relative overflow-hidden ${
          themeType === 'dark' ? 'bg-indigo-900 text-white' : 'bg-sand-50 text-ink-900'
        } ${innerClassName}`}
        style={{
          borderRadius: '999px 999px 18px 18px',
          border: `1.5px solid ${accentColor}55`,
        }}
      >
        {/* Double arche concentrique décorative en haut */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-36 border border-gold-400/20 rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-28 border border-gold-400/30 rounded-full pointer-events-none"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   5. Bordure Moucharabieh — Claustra ajouré pour les zones d'upload & audit
-------------------------------------------------------------------------- */
export const MoucharabiehBorder: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}> = ({ children, isActive = false, className = '' }) => {
  const { primaryColor } = useMoroccanTheme();

  return (
    <div
      className={`relative rounded-2xl p-0.5 transition-all ${className}`}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${primaryColor}, #C9962E)`
          : 'transparent',
      }}
    >
      <div
        className={`relative rounded-2xl border-2 border-dashed p-6 transition-all ${
          isActive
            ? 'border-transparent bg-terracotta-50/40'
            : 'border-sand-400 hover:border-terracotta-400 bg-white/70'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   6. Sélecteur de Thème Régional (Atlas Terracotta ⇄ Fès Cobalt)
-------------------------------------------------------------------------- */
export const RegionalThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useMoroccanTheme();
  const isFes = theme === 'fes';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isFes ? 'Basculer vers le thème Région Atlas & Safi (Terracotta)' : 'Basculer vers le thème Région Fès (Bleu Cobalt)'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        isFes
          ? 'bg-fes-50 text-fes-600 border-fes-300 hover:bg-fes-100'
          : 'bg-sand-200 text-terracotta-700 border-sand-300 hover:bg-sand-300'
      } ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full inline-block animate-pulse"
        style={{ backgroundColor: isFes ? '#1E4F8C' : '#C1440E' }}
      />
      <span className="hidden sm:inline font-medium">
        {isFes ? 'Fès (Cobalt)' : 'Atlas (Terracotta)'}
      </span>
    </button>
  );
};
