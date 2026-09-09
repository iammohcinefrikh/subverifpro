export interface CandidateJwtClaims {
  sub: string; // ID unique du candidat
  email: string;
  nom: string;
  prenom: string;
  role: 'CANDIDATE' | 'ADMIN';
  dossier_id?: string;
  iat: number; // Horodatage émission
  exp: number; // Horodatage expiration
}

const JWT_SECRET_KEY = 'subverif_secure_jwt_secret_key_2026_morocco_grants';

/**
 * Encode une chaîne en Base64URL
 */
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Décode une chaîne Base64URL
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Obtient la clé CryptoKey HMAC-SHA256
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(JWT_SECRET_KEY);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Génère un JSON Web Token (JWT) complet signé avec HMAC-SHA256
 */
export async function generateCandidateJwt(
  candidate: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    dossier_id?: string;
  },
  expiresInSeconds: number = 7 * 24 * 3600 // 7 jours par défaut
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: CandidateJwtClaims = {
    sub: candidate.id,
    email: candidate.email,
    nom: candidate.nom,
    prenom: candidate.prenom,
    role: 'CANDIDATE',
    dossier_id: candidate.dossier_id,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const cryptoKey = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(dataToSign)
  );

  let binarySig = '';
  const sigBytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < sigBytes.length; i++) {
    binarySig += String.fromCharCode(sigBytes[i]);
  }
  const encodedSignature = btoa(binarySig)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Décode et extrait le payload d'un token JWT sans bloquer
 */
export function decodeJwtClaims(token: string): CandidateJwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const jsonStr = base64UrlDecode(parts[1]);
    return JSON.parse(jsonStr) as CandidateJwtClaims;
  } catch {
    return null;
  }
}

/**
 * Vérifie l'intégrité cryptographique et la validité temporelle du JWT
 */
export async function verifyJwt(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const dataToSign = `${parts[0]}.${parts[1]}`;
    const signatureStr = parts[2];

    let base64Sig = signatureStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }
    const binary = atob(base64Sig);
    const signatureBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signatureBytes[i] = binary.charCodeAt(i);
    }

    const cryptoKey = await getCryptoKey();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      new TextEncoder().encode(dataToSign)
    );

    if (!isValid) return false;

    // Vérifier l'expiration
    const claims = decodeJwtClaims(token);
    if (!claims) return false;
    const now = Math.floor(Date.now() / 1000);
    return claims.exp > now;
  } catch {
    return false;
  }
}
