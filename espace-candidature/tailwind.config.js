/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette minérale & artisanale marocaine
        terracotta: {
          50: '#FDF7F4',
          100: '#FBECE6',
          200: '#F7D6C9',
          300: '#EEB19A',
          400: '#DE7E59',
          500: '#C1440E', // Primaire officiel : Poterie de Safi, tanneries de Fès
          600: '#A83B0C',
          700: '#8F3209', // Hover : Argile cuite
          800: '#752907',
          900: '#5C2006',
          950: '#3D1504',
        },
        emerald: {
          50: '#F0F9F6',
          100: '#DCF1EA',
          200: '#BCE5D7',
          300: '#8ED1BD',
          400: '#4EB395',
          500: '#0E5E4B', // Secondaire : Zellige vert de Fès, toits des médersas
          600: '#0B4D3D',
          700: '#083B2F',
          800: '#062A22',
          900: '#041B16',
        },
        gold: {
          50: '#FDFBF4',
          100: '#FAF4E3',
          200: '#F4E7C3',
          300: '#ECD296',
          400: '#D4A72C', // Cuivre martelé, dinandier de Marrakech
          500: '#C9962E', // Accent doré institutionnel
          600: '#B08225',
          700: '#946C1C',
          800: '#785514',
          900: '#5F420E',
        },
        indigo: {
          50: '#F3F6FA',
          100: '#E4ECF4',
          200: '#CAD8E7',
          300: '#A4BCD5',
          400: '#6C94BC',
          500: '#386A9E',
          600: '#265181',
          700: '#1E3E64',
          800: '#1C3452',
          900: '#1A2B4C', // Neutre noble : Nuit sur l'Atlas, encre de calligraphie
          950: '#101B30',
        },
        sand: {
          50: '#FCFAF6',
          100: '#FAF5EC', // Fond par défaut : Pisé, murs chauds de médina
          200: '#F1E7D3', // Fond profond / cartes d'accent
          300: '#E5D5B7',
          400: '#D4C097',
          500: '#C0A775',
        },
        ink: {
          800: '#382B20',
          900: '#241B14', // Corps de texte principal : Cuir tanné, encre
          950: '#17110C',
        },
        // Thème régional Fès (Bleu cobalt de Fès)
        fes: {
          50: '#F0F5FB',
          100: '#DCE8F6',
          200: '#BED4ED',
          300: '#8FB5DF',
          400: '#548ECB',
          500: '#1E4F8C', // Bleu poterie de Fès
          600: '#173F70',
          700: '#123056',
          800: '#0E2440',
          900: '#0A1A2D',
        },
        // Conservation de compatibilité brand
        brand: {
          50: '#FDF7F4',
          100: '#FBECE6',
          200: '#F7D6C9',
          500: '#C1440E',
          600: '#A83B0C',
          700: '#8F3209',
          800: '#752907',
          900: '#5C2006',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        arabic: ['Noto Kufi Arabic', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 27, 20, 0.04), 0 1px 2px -1px rgba(36, 27, 20, 0.04)',
        'card': '0 4px 16px -2px rgba(36, 27, 20, 0.06), 0 2px 6px -2px rgba(193, 68, 14, 0.04)',
        'elevation': '0 20px 25px -5px rgba(26, 43, 76, 0.1), 0 8px 10px -6px rgba(26, 43, 76, 0.05)',
        'bab': '0 20px 40px -15px rgba(26, 43, 76, 0.28), 0 0 0 1px rgba(201, 150, 46, 0.25)',
        'zellige': '0 4px 12px rgba(14, 94, 75, 0.15)',
      },
      borderRadius: {
        'arch': '999px 999px 18px 18px',
        'arch-inner': '999px 999px 14px 14px',
      }
    },
  },
  plugins: [],
}
