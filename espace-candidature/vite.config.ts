import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import path from 'node:path';
import apiHandler from './api/_handler.js';

function dbApiPlugin(): Plugin {
  return {
    name: 'db-api-plugin',
    configResolved(config) {
      const env = loadEnv(config.mode, process.cwd(), '');
      // Synchronisation avec process.env pour un comportement unifié local / Vercel
      for (const [key, val] of Object.entries(env)) {
        if (!process.env[key] && val) {
          process.env[key] = val;
        }
      }

      // Recherche de secours dans les dossiers parents si nécessaire
      if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
        try {
          const parentEnv = loadEnv(config.mode, path.resolve(process.cwd(), '..'), '');
          for (const [key, val] of Object.entries(parentEnv)) {
            if (!process.env[key] && val) {
              process.env[key] = val;
            }
          }
        } catch {}
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        apiHandler(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        apiHandler(req, res, next);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dbApiPlugin()],
  server: {
    proxy: {
      '/api/webhook-proxy': {
        target: 'https://stg-orch-api.abafusion.ai',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/webhook-proxy/, '')
      }
    }
  }
});
