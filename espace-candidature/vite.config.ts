import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import pg from 'pg';
import crypto from 'node:crypto';

/**
 * Fonction de hachage cryptographique sécurisé pour les mots de passe
 * Utilise scrypt (KDF durci en mémoire recommandé par l'OWASP)
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

/**
 * Vérification à temps constant d'un mot de passe contre son hash
 */
function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.startsWith('scrypt:')) {
    return storedHash === password;
  }
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalHash = parts[2];
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

function dbApiPlugin(): Plugin {
  let dbUrl: string | undefined;

  const handleMiddleware = (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (!url.startsWith('/api/candidate-users')) {
      return next();
    }

    if (!dbUrl) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'DIRECT_URL ou DATABASE_URL manquant dans .env' }));
      return;
    }

    // POST /api/candidate-users/login
    if (req.method === 'POST' && url === '/api/candidate-users/login') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        const { Client } = pg;
        const client = new Client({ connectionString: dbUrl });
        try {
          const { email, password } = JSON.parse(body || '{}');
          await client.connect();
          const dbRes = await client.query(
            'SELECT * FROM public.candidate_users WHERE LOWER(email) = LOWER($1) LIMIT 1;',
            [email?.trim()]
          );

          if (dbRes.rows.length === 0) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Identifiants invalides.' }));
            return;
          }

          const user = dbRes.rows[0];
          const isValid = verifyPassword(password, user.password_hash);
          if (!isValid) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Mot de passe incorrect.' }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, candidateUser: user }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        } finally {
          await client.end().catch(() => {});
        }
      });
      return;
    }

    // POST /api/candidate-users (Enregistrement d'un candidat avec hashage scrypt du mot de passe)
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        const { Client } = pg;
        const client = new Client({ connectionString: dbUrl });
        try {
          const data = JSON.parse(body || '{}');
          await client.connect();

          const rawPassword = data.password || 'password123';
          // Hashage du mot de passe avec scrypt + salt aléatoire
          const hashedPassword = hashPassword(rawPassword);

          const insertQuery = `
            INSERT INTO public.candidate_users (
              email,
              password_hash,
              nom,
              prenom,
              role,
              candidate_id,
              cin,
              phone,
              structure_nom,
              structure_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (email) DO UPDATE SET
              password_hash = EXCLUDED.password_hash,
              nom = EXCLUDED.nom,
              prenom = EXCLUDED.prenom,
              candidate_id = EXCLUDED.candidate_id,
              cin = EXCLUDED.cin,
              phone = EXCLUDED.phone,
              structure_nom = EXCLUDED.structure_nom,
              structure_type = EXCLUDED.structure_type,
              updated_at = NOW()
            RETURNING id, email, nom, prenom, role, candidate_id, cin, phone, structure_nom, structure_type, created_at, updated_at;
          `;

          const values = [
            data.email?.trim().toLowerCase(),
            hashedPassword,
            data.nom?.toUpperCase() || '',
            data.prenom || '',
            'CANDIDATE',
            data.candidate_id || null,
            data.cin || null,
            data.phone || null,
            data.structure_nom || null,
            data.structure_type || 'entreprise'
          ];

          const dbRes = await client.query(insertQuery, values);
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, candidateUser: dbRes.rows[0] }));
        } catch (err: any) {
          console.error('[API] Erreur insertion candidate_users:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        } finally {
          await client.end().catch(() => {});
        }
      });
      return;
    }

    // GET /api/candidate-users
    if (req.method === 'GET') {
      const { Client } = pg;
      const client = new Client({ connectionString: dbUrl });
      (async () => {
        try {
          await client.connect();
          const dbRes = await client.query(
            'SELECT id, email, nom, prenom, role, candidate_id, cin, phone, structure_nom, structure_type, created_at FROM public.candidate_users ORDER BY created_at DESC;'
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, candidates: dbRes.rows }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        } finally {
          await client.end().catch(() => {});
        }
      })();
      return;
    }

    next();
  };

  return {
    name: 'db-api-plugin',
    configResolved(config) {
      const env = loadEnv(config.mode, process.cwd(), '');
      dbUrl = env.DIRECT_URL || env.DATABASE_URL;
    },
    configureServer(server) {
      server.middlewares.use(handleMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleMiddleware);
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
