-- =============================================================================
-- Migration : Table d'Authentification des Candidats SubVerif & Seed Initial
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.candidate_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    cin VARCHAR(50),
    phone VARCHAR(50),
    structure_nom VARCHAR(255),
    structure_type VARCHAR(50) DEFAULT 'entreprise',
    role VARCHAR(50) DEFAULT 'CANDIDATE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_candidate_users_email ON public.candidate_users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_candidate_users_cin ON public.candidate_users(cin);

-- -----------------------------------------------------------------------------
-- Seed des comptes candidats de référence (enregistrés en base PostgreSQL)
-- -----------------------------------------------------------------------------
INSERT INTO public.candidate_users (
    id, candidate_id, email, password_hash, nom, prenom, cin, phone, structure_nom, structure_type, role
)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'cand-atlas-001',
        'amina@bio-atlas.ma',
        'password123',
        'BENKIRANE',
        'Amina',
        'BE123456',
        '0661234567',
        'Coopérative Bio Atlas',
        'cooperative',
        'CANDIDATE'
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'cand-agri-002',
        'karim@menara-innov.ma',
        'password123',
        'TAZI',
        'Karim',
        'BK789012',
        '0662345678',
        'Agri-Souss Technologies SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'cand-green-003',
        'fatima@greentech.ma',
        'password123',
        'ZAHRA',
        'Fatima',
        'C345678',
        '0663456789',
        'GreenTech Solutions SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'cand-solar-004',
        'youssef@atlastech-solutions.ma',
        'password123',
        'EL AMRANI',
        'Youssef',
        'CD567890',
        '0664567890',
        'AtlasTech Solutions SARL',
        'entreprise',
        'CANDIDATE'
    )
ON CONFLICT (email) DO UPDATE 
SET 
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom,
    cin = EXCLUDED.cin,
    phone = EXCLUDED.phone,
    structure_nom = EXCLUDED.structure_nom,
    structure_type = EXCLUDED.structure_type,
    password_hash = EXCLUDED.password_hash,
    updated_at = now();
