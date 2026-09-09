-- =============================================================================
-- Migration : Ajout des colonnes, Seed des 10 candidats mockés & Foreign Keys
-- =============================================================================

-- 1. Mise à jour de la structure candidate_users
ALTER TABLE public.candidate_users 
ADD COLUMN IF NOT EXISTS candidate_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS cin VARCHAR(30),
ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS structure_nom VARCHAR(255),
ADD COLUMN IF NOT EXISTS structure_type VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_candidate_users_candidate_id ON public.candidate_users(candidate_id);

-- 2. Insertion / Mise à jour des 10 candidats référents de MOCK_CANDIDATES
INSERT INTO public.candidate_users (id, candidate_id, email, password_hash, nom, prenom, cin, phone, structure_nom, structure_type, role)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'cand-1',
        'contact@atlastech-solutions.ma',
        'password123',
        'EL AMRANI',
        'Youssef',
        'BE890123',
        '0661234567',
        'ATLAS TECH SOLUTIONS SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'cand-2',
        'argania.coop@gmail.com',
        'password123',
        'AIT TALEB',
        'Fatima Zohra',
        'JH234561',
        '0663456789',
        'Coopérative Féminine Agricole Argania Bio',
        'autre',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'cand-3',
        'm.benjelloun@smart-irrigation.ma',
        'password123',
        'BENJELLOUN',
        'Mehdi',
        'CD567890',
        '0661987654',
        'Maroc Smart Irrigation & Agri-Tech SAS',
        'entreprise',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'cand-4',
        'contact@sante-pourtous.ma',
        'password123',
        'EL FASSI',
        'Nadia',
        'AB345678',
        '0662345678',
        'Association Maroc Santé Pour Tous',
        'association',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'cand-5',
        'artisanat.tazi@gmail.com',
        'password123',
        'TAZI',
        'Hassan',
        'C123456',
        '0661456789',
        'Atelier Maroquinier d''Art Fassi',
        'independant',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000006',
        'cand-6',
        'karim.benjelloun@greenenerg.ma',
        'password123',
        'BENJELLOUN',
        'Karim',
        'A218452',
        '0661998877',
        'Green Energy Solutions SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000007',
        'cand-7',
        'yassine.benali@studio3d-rif.ma',
        'password123',
        'BENALI',
        'Yassine',
        'RH123456',
        '0662887766',
        'Studio 3D & Animation du Rif SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000008',
        'cand-8',
        'apiculture.atlas@gmail.com',
        'password123',
        'CHRAIBI',
        'Tariq',
        'V345678',
        '0663112233',
        'Coopérative Apicole Miel du Moyen Atlas',
        'autre',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000009',
        'cand-9',
        'direction@biocompost-nord.ma',
        'password123',
        'BERRADA',
        'Salma',
        'K456789',
        '0661554433',
        'BioCompost & Recyclage Nord SARL',
        'entreprise',
        'CANDIDATE'
    ),
    (
        '00000000-0000-0000-0000-000000000010',
        'cand-10',
        'ajs.espoir.atlas@gmail.com',
        'password123',
        'AMRANI',
        'Omar',
        'I567890',
        '0664778899',
        'Association Jeunesse & Sport Espoir Atlas',
        'association',
        'CANDIDATE'
    )
ON CONFLICT (email) DO UPDATE
SET
    candidate_id = EXCLUDED.candidate_id,
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom,
    cin = EXCLUDED.cin,
    phone = EXCLUDED.phone,
    structure_nom = EXCLUDED.structure_nom,
    structure_type = EXCLUDED.structure_type,
    updated_at = now();

-- 3. Rapprochement des applications existantes avec leurs candidats respectifs par email
UPDATE public.applications a
SET candidate_id = u.id
FROM public.candidate_users u
WHERE a.email = u.email AND (a.candidate_id IS NULL OR a.candidate_id <> u.id);

-- 4. Rapprochement compliance_checks via applications
UPDATE public.compliance_checks c
SET candidate_id = a.candidate_id
FROM public.applications a
WHERE c.application_id = a.application_id AND a.candidate_id IS NOT NULL;

-- 5. Rapprochement complement_requests via applications
UPDATE public.complement_requests cr
SET candidate_id = a.candidate_id
FROM public.applications a
WHERE cr.application_id = a.application_id AND a.candidate_id IS NOT NULL;
