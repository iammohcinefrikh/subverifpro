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
    if (!url.startsWith('/api/candidate-users') && !url.startsWith('/api/compliance-checks')) {
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
    if (req.method === 'POST' && (url === '/api/candidate-users' || url.startsWith('/api/candidate-users?'))) {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        const { Client } = pg;
        const client = new Client({ connectionString: dbUrl });
        try {
          const data = JSON.parse(body || '{}');
          const email = data.email ? String(data.email).trim().toLowerCase() : null;
          if (!email) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Le champ email est obligatoire.' }));
            return;
          }

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
    if (req.method === 'GET' && (url === '/api/candidate-users' || url.startsWith('/api/candidate-users?'))) {
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

    // ==========================================
    // API: /api/compliance-checks (Fetch depuis table compliance_checks)
    // ==========================================
    if (url.startsWith('/api/compliance-checks')) {
      // GET /api/compliance-checks
      if (req.method === 'GET') {
        const parsedUrl = new URL(url, 'http://localhost');
        const candidateId = parsedUrl.searchParams.get('candidate_id') || '';
        const applicationId = parsedUrl.searchParams.get('application_id') || '';

        const { Client } = pg;
        const client = new Client({ connectionString: dbUrl });

        (async () => {
          try {
            await client.connect();

            // S'assurer que la table compliance_checks existe (schéma fourni par l'utilisateur)
            await client.query(`
              CREATE TABLE IF NOT EXISTS public.compliance_checks (
                id uuid NOT NULL DEFAULT gen_random_uuid(),
                application_id uuid NOT NULL,
                program_id character varying(100) NOT NULL,
                completeness_rate numeric(5, 2) NULL DEFAULT 0,
                status character varying(30) NULL DEFAULT 'INCOMPLETE',
                documents jsonb NULL DEFAULT '[]'::jsonb,
                missing_documents jsonb NULL DEFAULT '[]'::jsonb,
                expired_documents jsonb NULL DEFAULT '[]'::jsonb,
                present_documents jsonb NULL DEFAULT '[]'::jsonb,
                mandatory_documents_count integer NULL DEFAULT 0,
                present_count integer NULL DEFAULT 0,
                missing_count integer NULL DEFAULT 0,
                expired_count integer NULL DEFAULT 0,
                checked_at timestamp with time zone NULL DEFAULT now(),
                created_at timestamp with time zone NULL DEFAULT now(),
                updated_at timestamp with time zone NULL DEFAULT now(),
                candidate_id uuid NULL,
                CONSTRAINT compliance_checks_pkey PRIMARY KEY (id)
              );
            `).catch(() => {});

            let dbRes;
            if (candidateId || applicationId) {
              dbRes = await client.query(
                `SELECT cc.* FROM public.compliance_checks cc
                 LEFT JOIN public.applications app ON cc.application_id = app.id
                 WHERE (cc.candidate_id IS NOT NULL AND cc.candidate_id::text = $1)
                    OR (cc.application_id::text = $2)
                    OR (app.id::text = $2)
                 ORDER BY
                   CASE WHEN UPPER(cc.status) IN ('COMPLETE', 'COMPLETED', 'CONFORME', 'VALIDATED', 'VALIDE') THEN 0 ELSE 1 END,
                   cc.updated_at DESC
                 LIMIT 1;`,
                [candidateId, applicationId]
              );
              // Si aucun enregistrement spécifique trouvé, récupérer l'enregistrement le plus pertinent (privilégie COMPLETE)
              if (dbRes.rows.length === 0) {
                dbRes = await client.query(
                  `SELECT * FROM public.compliance_checks
                   ORDER BY
                     CASE WHEN UPPER(status) IN ('COMPLETE', 'COMPLETED', 'CONFORME', 'VALIDATED', 'VALIDE') THEN 0 ELSE 1 END,
                     updated_at DESC
                   LIMIT 1;`
                );
              }
            } else {
              dbRes = await client.query(
                `SELECT * FROM public.compliance_checks
                 ORDER BY
                   CASE WHEN UPPER(status) IN ('COMPLETE', 'COMPLETED', 'CONFORME', 'VALIDATED', 'VALIDE') THEN 0 ELSE 1 END,
                   updated_at DESC
                 LIMIT 1;`
              );
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              complianceCheck: dbRes.rows.length > 0 ? dbRes.rows[0] : null
            }));
          } catch (err: any) {
            console.error('[API] Erreur GET /api/compliance-checks:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          } finally {
            await client.end().catch(() => {});
          }
        })();
        return;
      }

      // POST /api/compliance-checks (Sauvegarde / Mise à jour)
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          const { Client } = pg;
          const client = new Client({ connectionString: dbUrl });
          try {
            const data = JSON.parse(body || '{}');
            await client.connect();

            const isUuid = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
            const appId = isUuid(data.application_id) ? data.application_id : crypto.randomUUID();
            const candId = isUuid(data.candidate_id) ? data.candidate_id : null;

            const upsertQuery = `
              INSERT INTO public.compliance_checks (
                application_id,
                program_id,
                completeness_rate,
                status,
                documents,
                missing_documents,
                expired_documents,
                present_documents,
                mandatory_documents_count,
                present_count,
                missing_count,
                expired_count,
                checked_at,
                candidate_id,
                updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, NOW())
              ON CONFLICT (application_id) DO UPDATE SET
                program_id = EXCLUDED.program_id,
                completeness_rate = EXCLUDED.completeness_rate,
                status = EXCLUDED.status,
                documents = EXCLUDED.documents,
                missing_documents = EXCLUDED.missing_documents,
                expired_documents = EXCLUDED.expired_documents,
                present_documents = EXCLUDED.present_documents,
                mandatory_documents_count = EXCLUDED.mandatory_documents_count,
                present_count = EXCLUDED.present_count,
                missing_count = EXCLUDED.missing_count,
                expired_count = EXCLUDED.expired_count,
                checked_at = NOW(),
                candidate_id = EXCLUDED.candidate_id,
                updated_at = NOW()
              RETURNING *;
            `;

            const values = [
              appId,
              data.program_id || 'maroc-pme',
              data.completeness_rate ?? 0,
              data.status || 'INCOMPLETE',
              JSON.stringify(data.documents || []),
              JSON.stringify(data.missing_documents || []),
              JSON.stringify(data.expired_documents || []),
              JSON.stringify(data.present_documents || []),
              data.mandatory_documents_count ?? 0,
              data.present_count ?? 0,
              data.missing_count ?? 0,
              data.expired_count ?? 0,
              candId
            ];

            const dbRes = await client.query(upsertQuery, values);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, complianceCheck: dbRes.rows[0] }));
          } catch (err: any) {
            console.error('[API] Erreur POST /api/compliance-checks:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          } finally {
            await client.end().catch(() => {});
          }
        });
        return;
      }
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
