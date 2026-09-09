-- =============================================================================
-- Migration : Table d'Authentification des Candidats SubVerif & Seed Initial
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.candidate_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'CANDIDATE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_users_email ON public.candidate_users(email);

-- -----------------------------------------------------------------------------
-- Seed des candidats de référence (identiques aux profils mockés)
-- -----------------------------------------------------------------------------
INSERT INTO public.candidate_users (id, email, password_hash, nom, prenom, role)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'youssef@atlastech-solutions.ma',
        'password123',
        'EL AMRANI',
        'Youssef',
        'CANDIDATE'
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'amina@bio-atlas.ma',
        'password123',
        'BENKIRANE',
        'Amina',
        'CANDIDATE'
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'karim@menara-innov.ma',
        'password123',
        'TAZI',
        'Karim',
        'CANDIDATE'
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'rachid@artisanat-moderne.ma',
        'password123',
        'EL IDRISSI',
        'Rachid',
        'CANDIDATE'
    )
ON CONFLICT (email) DO UPDATE 
SET 
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom,
    password_hash = EXCLUDED.password_hash,
    updated_at = now();
