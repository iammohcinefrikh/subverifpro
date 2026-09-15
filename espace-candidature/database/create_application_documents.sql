-- =============================================================================
-- Migration : Création de la table application_documents
-- Stockage des métadonnées des pièces jointes (fichiers dans Supabase Storage)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    type_document VARCHAR(100) NOT NULL,
    taille BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    statut_ocr VARCHAR(50) DEFAULT 'en_attente'
);

-- Index pour charger instantanément les pièces d'un dossier
CREATE INDEX IF NOT EXISTS idx_application_documents_app_id 
ON public.application_documents(application_id);
