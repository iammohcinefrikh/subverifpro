import pg from 'pg';
import crypto from 'node:crypto';

/**
 * Fonction de hachage cryptographique sécurisé pour les mots de passe (scrypt)
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

async function uploadToSupabaseStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<boolean> {
  try {
    const url = `${supabaseUrl}/storage/v1/object/application-documents/${storagePath}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': contentType || 'application/pdf',
        'x-upsert': 'true'
      },
      body: new Uint8Array(buffer)
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Erreur upload:', err);
    return false;
  }
}

function buildFileBuffer(doc: any, docName: string): { buffer: Buffer; contentType: string } {
  if (doc.fichier_base64 && typeof doc.fichier_base64 === 'string' && doc.fichier_base64.trim().length > 0) {
    const raw = doc.fichier_base64.includes(',') ? doc.fichier_base64.split(',')[1] : doc.fichier_base64;
    const isPng = doc.nom_fichier?.toLowerCase().endsWith('.png') || doc.fichier_base64.startsWith('data:image/png');
    const isJpg = doc.nom_fichier?.toLowerCase().endsWith('.jpg') || doc.nom_fichier?.toLowerCase().endsWith('.jpeg') || doc.fichier_base64.startsWith('data:image/jpeg');
    const contentType = isPng ? 'image/png' : (isJpg ? 'image/jpeg' : 'application/pdf');
    return { buffer: Buffer.from(raw, 'base64'), contentType };
  }

  const safeName = String(docName || 'Document').replace(/[^a-zA-Z0-9 _-]/g, '');
  const pdfStr = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 75 >> stream
BT /F1 16 Tf 50 720 Td (PIECE CERTIFIEE SUBVERIF: ${safeName}) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000253 00000 n 
0000000378 00000 n 
trailer << /Root 1 0 R /Size 6 >>
startxref
452
%%EOF`;
  return { buffer: Buffer.from(pdfStr, 'utf-8'), contentType: 'application/pdf' };
}

/**
 * Extraction robuste du corps de la requête (compatible Vercel Serverless & Node stream)
 */
async function getRequestBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return req.body;
      }
    }
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

/**
 * Résolution normalisée de l'URL de requête (gère les rewrites Vercel et chemins directs)
 */
function getRequestUrl(req: any): string {
  const matched = (req.headers && (req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'])) as string | undefined;
  const rawUrl = req.url || '';

  let pathname = '';
  let search = '';

  if (rawUrl.includes('?')) {
    const [p, s] = rawUrl.split('?', 2);
    pathname = p;
    search = `?${s}`;
  } else {
    pathname = rawUrl;
  }

  if (matched && matched !== '/api' && matched !== '/api/' && matched !== '/') {
    pathname = matched;
  }

  if (!pathname.startsWith('/api')) {
    pathname = `/api${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  }

  return pathname + search;
}

/**
 * Obtenir un client Postgres configuré pour Supabase (local ou Vercel Serverless)
 */
function getDbClient(dbUrl: string) {
  const { Client } = pg;
  const isCloud = dbUrl.includes('supabase.co') || dbUrl.includes('supabase.com') || dbUrl.includes('pooler.supabase');
  return new Client({
    connectionString: dbUrl,
    ssl: isCloud ? { rejectUnauthorized: false } : undefined
  });
}

/**
 * Gestionnaire principal de l'API (utilisable à la fois par Vite dev server et Vercel Serverless Functions)
 */
export default async function apiHandler(req: any, res: any, next?: () => void) {
  const url = getRequestUrl(req);

  // Configuration universelle des headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // 1. PROXY WEBHOOK (/api/webhook-proxy)
  // --------------------------------------------------------------------------
  if (url.startsWith('/api/webhook-proxy')) {
    const subPath = url.replace(/^\/api\/webhook-proxy/, '');
    const targetUrl = `https://stg-orch-api.abafusion.ai${subPath}`;
    try {
      const headers: Record<string, string> = {};
      if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
      if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'];

      let bodyData: any = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const bodyObj = await getRequestBody(req);
        bodyData = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: bodyData
      });

      const data = await response.text();
      res.statusCode = response.status;
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
      res.end(data);
      return;
    } catch (err: any) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Erreur webhook proxy: ${err.message}` }));
      return;
    }
  }

  // Vérification de la compatibilité avec les routes backend gérées
  const isCandidateUsers = url.startsWith('/api/candidate-users');
  const isComplianceChecks = url.startsWith('/api/compliance-checks');
  const isApplications = url.startsWith('/api/applications');
  const isApplicationDocuments = url.startsWith('/api/application-documents');

  if (!isCandidateUsers && !isComplianceChecks && !isApplications && !isApplicationDocuments) {
    if (typeof next === 'function') {
      return next();
    }
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route API introuvable', path: url }));
    return;
  }

  // Résolution des paramètres de connexion Supabase / Postgres
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mtbtvivmdfrrujehkpvx.supabase.co';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!dbUrl) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'DIRECT_URL ou DATABASE_URL manquant dans les variables d\'environnement' }));
    return;
  }

  // --------------------------------------------------------------------------
  // 2. CANDIDATE USERS
  // --------------------------------------------------------------------------
  if (url.startsWith('/api/candidate-users/check-email') && req.method === 'GET') {
    const parsedUrl = new URL(url, 'http://localhost');
    const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Paramètre email manquant.' }));
      return;
    }

    const client = getDbClient(dbUrl);
    try {
      await client.connect();
      const checkRes = await client.query(
        `SELECT cu.id, cu.email, cu.nom, cu.prenom, app.application_id, app.status AS application_status
         FROM public.candidate_users cu
         LEFT JOIN public.applications app ON (app.candidate_id = cu.id OR LOWER(app.email) = LOWER(cu.email))
         WHERE LOWER(cu.email) = LOWER($1)
         LIMIT 1;`,
        [email]
      );

      if (checkRes.rows.length > 0) {
        const row = checkRes.rows[0];
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          exists: true,
          email: row.email,
          nom: row.nom,
          prenom: row.prenom,
          hasApplication: !!row.application_id,
          applicationStatus: row.application_status || null
        }));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ exists: false }));
      }
    } catch (err: any) {
      console.error('[API] Erreur check-email:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } finally {
      await client.end().catch(() => {});
    }
    return;
  }

  if (req.method === 'POST' && (url === '/api/candidate-users/login' || url.startsWith('/api/candidate-users/login?') || url.startsWith('/api/candidate-users/login/'))) {
    const client = getDbClient(dbUrl);
    try {
      const { email, password } = await getRequestBody(req);
      const cleanEmail = email?.trim().toLowerCase();
      await client.connect();

      const dbRes = await client.query(
        'SELECT * FROM public.candidate_users WHERE LOWER(email) = LOWER($1) LIMIT 1;',
        [cleanEmail]
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

      const appRes = await client.query(
        `SELECT * FROM public.applications 
         WHERE (candidate_id IS NOT NULL AND candidate_id = $3)
            OR LOWER(email) = LOWER($1) 
            OR (cin IS NOT NULL AND cin = $2)
         ORDER BY created_at DESC 
         LIMIT 1;`,
        [cleanEmail, user.cin || '', user.id]
      );

      if (appRes.rows[0] && !appRes.rows[0].candidate_id) {
        await client.query('UPDATE public.applications SET candidate_id = $1 WHERE id = $2', [user.id, appRes.rows[0].id]).catch(() => {});
        appRes.rows[0].candidate_id = user.id;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        candidateUser: user,
        application: appRes.rows[0] || null
      }));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } finally {
      await client.end().catch(() => {});
    }
    return;
  }

  if (req.method === 'POST' && (url === '/api/candidate-users' || url.startsWith('/api/candidate-users?'))) {
    const client = getDbClient(dbUrl);
    try {
      const data = await getRequestBody(req);
      const email = data.email ? String(data.email).trim().toLowerCase() : null;
      if (!email) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Le champ email est obligatoire.' }));
        return;
      }

      await client.connect();

      const existingUserRes = await client.query(
        'SELECT id, email, nom, prenom FROM public.candidate_users WHERE LOWER(email) = LOWER($1) LIMIT 1;',
        [email]
      );

      if (existingUserRes.rows.length > 0) {
        res.statusCode = 409;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          code: 'USER_ALREADY_EXISTS',
          error: 'Cet utilisateur possède déjà un compte enregistré. Veuillez vous connecter pour accéder à votre tableau de bord.',
          email: email
        }));
        return;
      }

      const rawPassword = data.password || 'password123';
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
      const newUser = dbRes.rows[0];

      await client.query(
        'UPDATE public.applications SET candidate_id = $1 WHERE LOWER(email) = LOWER($2) AND (candidate_id IS NULL OR candidate_id <> $1);',
        [newUser.id, email]
      ).catch(() => {});

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, candidateUser: newUser }));
    } catch (err: any) {
      if (err?.code === '23505') {
        res.statusCode = 409;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          code: 'USER_ALREADY_EXISTS',
          error: 'Cet utilisateur possède déjà un compte ou un dossier enregistré. Veuillez vous connecter pour accéder à votre tableau de bord.'
        }));
        return;
      }
      console.error('[API] Erreur insertion candidate_users:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } finally {
      await client.end().catch(() => {});
    }
    return;
  }

  if (req.method === 'GET' && (url === '/api/candidate-users' || url.startsWith('/api/candidate-users?'))) {
    const client = getDbClient(dbUrl);
    try {
      await client.connect();
      const dbRes = await client.query(
        `SELECT 
          cu.id,
          cu.email,
          cu.nom,
          cu.prenom,
          cu.role,
          cu.candidate_id,
          cu.cin,
          cu.phone,
          cu.structure_nom,
          cu.structure_type,
          cu.created_at,
          app.application_id,
          app.status as application_status
        FROM public.candidate_users cu
        LEFT JOIN public.applications app ON (app.candidate_id = cu.id OR LOWER(app.email) = LOWER(cu.email))
        ORDER BY cu.created_at DESC;`
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
    return;
  }

  // --------------------------------------------------------------------------
  // 3. COMPLIANCE CHECKS
  // --------------------------------------------------------------------------
  if (url.startsWith('/api/compliance-checks')) {
    if (req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const candidateId = parsedUrl.searchParams.get('candidate_id') || '';
      const applicationId = parsedUrl.searchParams.get('application_id') || '';

      const client = getDbClient(dbUrl);
      try {
        await client.connect();
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

        let dbRes = { rows: [] as any[] };
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
      return;
    }

    if (req.method === 'POST') {
      const client = getDbClient(dbUrl);
      try {
        const data = await getRequestBody(req);
        await client.connect();

        const isUuid = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const candId = isUuid(data.candidate_id) ? data.candidate_id : null;
        const checkId = isUuid(data.id) ? data.id : null;
        const rawAppId = isUuid(data.application_id) ? data.application_id : null;

        let validCandidateId: string | null = null;
        if (candId) {
          const checkCand = await client.query(
            'SELECT id FROM public.candidate_users WHERE id = $1 LIMIT 1',
            [candId]
          ).catch(() => ({ rows: [] }));
          if (checkCand.rows.length > 0) {
            validCandidateId = checkCand.rows[0].id;
          }
        }

        let canonicalAppId = null;

        if (rawAppId) {
          const checkApp = await client.query(
            'SELECT application_id FROM public.applications WHERE application_id = $1 LIMIT 1',
            [rawAppId]
          ).catch(() => ({ rows: [] }));
          if (checkApp.rows.length > 0) {
            canonicalAppId = checkApp.rows[0].application_id;
          }
        }

        if (!canonicalAppId && validCandidateId) {
          const checkByCand = await client.query(
            'SELECT application_id FROM public.applications WHERE candidate_id = $1 ORDER BY created_at DESC LIMIT 1',
            [validCandidateId]
          ).catch(() => ({ rows: [] }));
          if (checkByCand.rows.length > 0) {
            canonicalAppId = checkByCand.rows[0].application_id;
          }
        }

        if (!canonicalAppId) {
          const defaultApp = await client.query(
            'SELECT application_id FROM public.applications ORDER BY created_at DESC LIMIT 1'
          ).catch(() => ({ rows: [] }));
          if (defaultApp.rows.length > 0) {
            canonicalAppId = defaultApp.rows[0].application_id;
          }
        }

        if (!canonicalAppId) {
          const newAppId = crypto.randomUUID();
          await client.query(`
            INSERT INTO public.applications (
              id, application_id, program_id, candidate_id, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 'SUBMITTED', NOW(), NOW())
          `, [crypto.randomUUID(), newAppId, data.program_id || 'prog-forsa', candId]);
          canonicalAppId = newAppId;
        }

        let existingRow = null;
        if (checkId) {
          const r = await client.query('SELECT * FROM public.compliance_checks WHERE id = $1 LIMIT 1', [checkId]);
          if (r.rows.length > 0) existingRow = r.rows[0];
        }
        if (!existingRow && canonicalAppId) {
          const r = await client.query('SELECT * FROM public.compliance_checks WHERE application_id = $1 LIMIT 1', [canonicalAppId]);
          if (r.rows.length > 0) existingRow = r.rows[0];
        }
        if (!existingRow && candId) {
          const r = await client.query('SELECT * FROM public.compliance_checks WHERE candidate_id = $1 LIMIT 1', [candId]);
          if (r.rows.length > 0) existingRow = r.rows[0];
        }
        if (!existingRow) {
          const r = await client.query('SELECT * FROM public.compliance_checks ORDER BY updated_at DESC LIMIT 1');
          if (r.rows.length > 0) existingRow = r.rows[0];
        }

        const serializeJson = (val: any) => {
          if (val === null || val === undefined) return '[]';
          if (typeof val === 'string') {
            try {
              JSON.parse(val);
              return val;
            } catch {
              return JSON.stringify(val);
            }
          }
          return JSON.stringify(val);
        };

        let resultRow;
        if (existingRow) {
          const updateQuery = `
            UPDATE public.compliance_checks SET
              completeness_rate = $1,
              status = $2,
              documents = $3::jsonb,
              missing_documents = $4::jsonb,
              expired_documents = $5::jsonb,
              present_documents = $6::jsonb,
              mandatory_documents_count = $7,
              present_count = $8,
              missing_count = $9,
              expired_count = $10,
              checked_at = NOW(),
              updated_at = NOW(),
              candidate_id = COALESCE($11, candidate_id)
            WHERE id = $12
            RETURNING *;
          `;

          const updateValues = [
            data.completeness_rate !== undefined ? data.completeness_rate : existingRow.completeness_rate,
            data.status || existingRow.status,
            serializeJson(data.documents !== undefined ? data.documents : existingRow.documents),
            serializeJson(data.missing_documents !== undefined ? data.missing_documents : existingRow.missing_documents),
            serializeJson(data.expired_documents !== undefined ? data.expired_documents : existingRow.expired_documents),
            serializeJson(data.present_documents !== undefined ? data.present_documents : existingRow.present_documents),
            data.mandatory_documents_count !== undefined ? data.mandatory_documents_count : existingRow.mandatory_documents_count,
            data.present_count !== undefined ? data.present_count : existingRow.present_count,
            data.missing_count !== undefined ? data.missing_count : existingRow.missing_count,
            data.expired_count !== undefined ? data.expired_count : existingRow.expired_count,
            validCandidateId,
            existingRow.id
          ];

          const dbRes = await client.query(updateQuery, updateValues);
          resultRow = dbRes.rows[0];
        } else {
          const progRes = await client.query('SELECT id FROM public.programs LIMIT 1').catch(() => ({ rows: [] }));
          const validProg = progRes.rows[0]?.id || 'prog-forsa';

          const insertQuery = `
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
            ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, $11, $12, NOW(), $13, NOW())
            RETURNING *;
          `;

          const insertValues = [
            canonicalAppId,
            data.program_id || validProg,
            data.completeness_rate ?? 0,
            data.status || 'INCOMPLETE',
            serializeJson(data.documents),
            serializeJson(data.missing_documents),
            serializeJson(data.expired_documents),
            serializeJson(data.present_documents),
            data.mandatory_documents_count ?? 0,
            data.present_count ?? 0,
            data.missing_count ?? 0,
            data.expired_count ?? 0,
            validCandidateId
          ];

          const dbRes = await client.query(insertQuery, insertValues);
          resultRow = dbRes.rows[0];
        }

        const compRate = Number(data.completeness_rate !== undefined ? data.completeness_rate : (resultRow.completeness_rate ?? 0));
        const missingCnt = Number(data.missing_count !== undefined ? data.missing_count : (resultRow.missing_count ?? 0));
        const isConforme = (compRate >= 100 || missingCnt === 0) && compRate > 0;
        const appStatus = isConforme ? 'CONFORME' : 'INCOMPLETE';

        if (canonicalAppId || validCandidateId) {
          await client.query(`
            UPDATE public.applications
            SET
              status = $1::public.application_status,
              compliance_rate = $2,
              documents = COALESCE($3::jsonb, documents),
              updated_at = NOW()
            WHERE application_id = $4 
               OR id = $4 
               OR (candidate_id IS NOT NULL AND candidate_id = $5);
          `, [
            appStatus,
            compRate,
            serializeJson(resultRow.documents || data.documents),
            canonicalAppId,
            validCandidateId
          ]).catch((err: any) => {
            console.warn('[API] Erreur synchronisation applications:', err.message);
          });
        }

        if (canonicalAppId && Array.isArray(data.documents) && data.documents.length > 0) {
          await client.query('DELETE FROM public.application_documents WHERE application_id = $1', [canonicalAppId]).catch(() => {});
          for (const doc of data.documents) {
            const typeDoc = String(doc.type_declare || doc.type_document || doc.type || 'autre').slice(0, 100);
            const docName = String(doc.nom_fichier || doc.nom || `${typeDoc}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileSize = Number(doc.taille) || (doc.fichier_base64 ? Math.round(doc.fichier_base64.length * 0.75) : 256000);
            const storagePath = doc.storage_path || `applications/${canonicalAppId}/${typeDoc}_${docName}`;
            const publicUrl = doc.url || `https://mtbtvivmdfrrujehkpvx.supabase.co/storage/v1/object/public/application-documents/${storagePath}`;
            const statutOcr = String(doc.statut_ocr || (doc.statut === 'CONFORME' ? 'succes' : 'en_attente')).slice(0, 50);

            await client.query(`
              INSERT INTO public.application_documents (
                application_id, type_document, taille, storage_path, url, statut_ocr
              ) VALUES ($1, $2, $3, $4, $5, $6);
            `, [canonicalAppId, typeDoc, fileSize, storagePath, publicUrl, statutOcr]).catch(() => {});

            if (supabaseKey) {
              const { buffer, contentType } = buildFileBuffer(doc, docName);
              await uploadToSupabaseStorage(storagePath, buffer, contentType, supabaseUrl, supabaseKey);
            }
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, complianceCheck: resultRow }));
      } catch (err: any) {
        console.error('[API] Erreur POST /api/compliance-checks:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await client.end().catch(() => {});
      }
      return;
    }
  }

  // --------------------------------------------------------------------------
  // 4. APPLICATIONS
  // --------------------------------------------------------------------------
  if (url.startsWith('/api/applications')) {
    if (req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const appId = parsedUrl.searchParams.get('application_id') || parsedUrl.searchParams.get('id') || '';
      const candId = parsedUrl.searchParams.get('candidate_id') || '';

      const client = getDbClient(dbUrl);
      try {
        await client.connect();
        let dbRes;
        if (appId || candId) {
          dbRes = await client.query(
            `SELECT * FROM public.applications
             WHERE (application_id::text = $1 OR id::text = $1)
                OR (candidate_id IS NOT NULL AND candidate_id::text = $2)
             ORDER BY updated_at DESC
             LIMIT 1;`,
            [appId, candId]
          );
        } else {
          dbRes = await client.query('SELECT * FROM public.applications ORDER BY created_at DESC LIMIT 50;');
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          application: dbRes.rows.length > 0 ? dbRes.rows[0] : null,
          applications: dbRes.rows
        }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await client.end().catch(() => {});
      }
      return;
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      const client = getDbClient(dbUrl);
      try {
        const data = await getRequestBody(req);
        await client.connect();

        const isUuid = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const targetAppId = isUuid(data.application_id) ? data.application_id : (isUuid(data.id) ? data.id : null);
        const candId = isUuid(data.candidate_id) ? data.candidate_id : null;

        let computedStatus = data.status;
        if (data.status === 'SUBMITTED') {
          computedStatus = 'SUBMITTED';
        } else if (data.compliance_rate !== undefined && data.compliance_rate !== null) {
          const rate = Number(data.compliance_rate);
          computedStatus = rate >= 100 ? 'CONFORME' : 'INCOMPLETE';
        }

        let updatedRow = null;
        if (targetAppId || candId) {
          const resUpdate = await client.query(`
            UPDATE public.applications
            SET
              status = COALESCE($1::public.application_status, status),
              compliance_rate = $2,
              documents = COALESCE($3::jsonb, documents),
              total_amount = COALESCE($4, total_amount),
              requested_amount = COALESCE($5, requested_amount),
              depenses = COALESCE($6::jsonb, depenses),
              financements = COALESCE($7::jsonb, financements),
              project_object = COALESCE($8, project_object),
              project_description = COALESCE($9, project_description),
              submitted_at = COALESCE($10::timestamptz, submitted_at),
              candidate_id = COALESCE($11, candidate_id),
              updated_at = NOW()
            WHERE application_id = $12 OR id = $12 OR (candidate_id IS NOT NULL AND candidate_id = $11)
            RETURNING *;
          `, [
            computedStatus || null,
            data.compliance_rate !== undefined ? Number(data.compliance_rate) : null,
            data.documents ? JSON.stringify(data.documents) : null,
            data.total_amount ? Number(data.total_amount) : null,
            data.requested_amount ? Number(data.requested_amount) : null,
            data.depenses ? JSON.stringify(data.depenses) : null,
            data.financements ? JSON.stringify(data.financements) : null,
            data.project_object || null,
            data.project_description || null,
            data.submitted_at || null,
            candId,
            targetAppId
          ]);
          if (resUpdate.rows.length > 0) {
            updatedRow = resUpdate.rows[0];
          }

          if (computedStatus === 'SUBMITTED') {
            await client.query(`
              UPDATE public.compliance_checks
              SET
                status = 'INCOMPLETE',
                completeness_rate = 0,
                checked_at = NOW(),
                updated_at = NOW()
              WHERE application_id = $1 OR (candidate_id IS NOT NULL AND candidate_id = $2);
            `, [targetAppId, candId]).catch(() => {});
          }

          const syncAppId = targetAppId || (updatedRow ? (updatedRow.application_id || updatedRow.id) : null);
          if (syncAppId && Array.isArray(data.documents) && data.documents.length > 0) {
            await client.query('DELETE FROM public.application_documents WHERE application_id = $1', [syncAppId]).catch(() => {});
            for (const doc of data.documents) {
              const typeDoc = String(doc.type_declare || doc.type_document || doc.type || 'autre').slice(0, 100);
              const docName = String(doc.nom_fichier || doc.nom || `${typeDoc}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
              const fileSize = Number(doc.taille) || (doc.fichier_base64 ? Math.round(doc.fichier_base64.length * 0.75) : 256000);
              const storagePath = doc.storage_path || `applications/${syncAppId}/${typeDoc}_${docName}`;
              const publicUrl = doc.url || `https://mtbtvivmdfrrujehkpvx.supabase.co/storage/v1/object/public/application-documents/${storagePath}`;
              const statutOcr = String(doc.statut_ocr || (doc.texte_ocr ? 'succes' : 'en_attente')).slice(0, 50);

              await client.query(`
                INSERT INTO public.application_documents (
                  application_id, type_document, taille, storage_path, url, statut_ocr
                ) VALUES ($1, $2, $3, $4, $5, $6);
              `, [syncAppId, typeDoc, fileSize, storagePath, publicUrl, statutOcr]).catch((e) => {
                console.warn('[API] Erreur insertion application_documents:', e.message);
              });

              if (supabaseKey) {
                const { buffer, contentType } = buildFileBuffer(doc, docName);
                await uploadToSupabaseStorage(storagePath, buffer, contentType, supabaseUrl, supabaseKey);
              }
            }
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, application: updatedRow }));
      } catch (err: any) {
        console.error('[API] Erreur /api/applications:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await client.end().catch(() => {});
      }
      return;
    }
  }

  // --------------------------------------------------------------------------
  // 5. APPLICATION DOCUMENTS
  // --------------------------------------------------------------------------
  if (url.startsWith('/api/application-documents')) {
    if (req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const appId = parsedUrl.searchParams.get('application_id') || '';
      const candId = parsedUrl.searchParams.get('candidate_id') || '';

      const client = getDbClient(dbUrl);
      try {
        await client.connect();
        let dbRes;
        if (appId) {
          dbRes = await client.query(
            `SELECT ad.id, ad.application_id, ad.type_document, ad.taille, ad.storage_path, ad.url, ad.statut_ocr
             FROM public.application_documents ad
             WHERE ad.application_id::text = $1
             ORDER BY ad.type_document ASC;`,
            [appId]
          );
        } else if (candId) {
          dbRes = await client.query(
            `SELECT ad.id, ad.application_id, ad.type_document, ad.taille, ad.storage_path, ad.url, ad.statut_ocr
             FROM public.application_documents ad
             JOIN public.applications app ON (app.application_id = ad.application_id OR app.id = ad.application_id)
             WHERE app.candidate_id::text = $1
             ORDER BY ad.type_document ASC;`,
            [candId]
          );
        } else {
          dbRes = await client.query(
            `SELECT ad.id, ad.application_id, ad.type_document, ad.taille, ad.storage_path, ad.url, ad.statut_ocr
             FROM public.application_documents ad
             ORDER BY ad.application_id, ad.type_document ASC
             LIMIT 100;`
          );
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, documents: dbRes.rows }));
      } catch (err: any) {
        console.error('[API] Erreur GET /api/application-documents:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await client.end().catch(() => {});
      }
      return;
    }

    if (req.method === 'POST') {
      const client = getDbClient(dbUrl);
      try {
        const data = await getRequestBody(req);
        await client.connect();

        const isUuid = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const appId = isUuid(data.application_id) ? data.application_id : null;

        if (!appId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'application_id UUID obligatoire.' }));
          return;
        }

        const docsToInsert = Array.isArray(data.documents) ? data.documents : [data];
        const insertedRows = [];

        for (const doc of docsToInsert) {
          const typeDoc = String(doc.type_document || doc.type_declare || doc.type || 'autre').slice(0, 100);
          const docName = String(doc.nom_fichier || doc.nom || `${typeDoc}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileSize = Number(doc.taille) || (doc.fichier_base64 ? Math.round(doc.fichier_base64.length * 0.75) : 256000);
          const storagePath = doc.storage_path || `applications/${appId}/${typeDoc}_${docName}`;
          const publicUrl = doc.url || `https://mtbtvivmdfrrujehkpvx.supabase.co/storage/v1/object/public/application-documents/${storagePath}`;
          const statutOcr = String(doc.statut_ocr || (doc.texte_ocr ? 'succes' : 'en_attente')).slice(0, 50);

          const insRes = await client.query(`
            INSERT INTO public.application_documents (
              application_id, type_document, taille, storage_path, url, statut_ocr
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
          `, [appId, typeDoc, fileSize, storagePath, publicUrl, statutOcr]);
          if (insRes.rows[0]) insertedRows.push(insRes.rows[0]);

          if (supabaseKey) {
            const { buffer, contentType } = buildFileBuffer(doc, docName);
            await uploadToSupabaseStorage(storagePath, buffer, contentType, supabaseUrl, supabaseKey);
          }
        }

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, documents: insertedRows }));
      } catch (err: any) {
        console.error('[API] Erreur POST /api/application-documents:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await client.end().catch(() => {});
      }
      return;
    }
  }

  if (typeof next === 'function') {
    return next();
  }
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Endpoint introuvable' }));
}
