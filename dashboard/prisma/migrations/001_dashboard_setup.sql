-- ==============================================================================
-- SubVerif Pro Database Migration
-- 001_dashboard_setup.sql
-- 
-- Description:
--   1. Creates Better-Auth tables ("user", "session", "account", "verification")
--      with instructor custom fields (full_name, is_active).
--   2. Migrates existing data from "instructors" into "user".
--   3. Updates "applications.assigned_instructor" foreign key to reference "user"(id).
--   4. Creates "dossier_events" table for application audit trail / history.
--   5. Safely drops "instructors" table once data & FK are transferred.
-- ==============================================================================

BEGIN;

-- 1. Create Better-Auth "user" table (replaces instructors)
CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image           TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Custom fields for SubVerif Pro instructors
  full_name       VARCHAR,
  is_active       BOOLEAN DEFAULT TRUE
);

-- 2. Migrate existing data from instructors table (if instructors exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'instructors') THEN
    INSERT INTO "user" (id, name, email, full_name, is_active, "createdAt", "updatedAt")
    SELECT 
      id::text, 
      full_name, 
      email, 
      full_name, 
      COALESCE(is_active, TRUE), 
      COALESCE(created_at, NOW()), 
      NOW()
    FROM instructors
    ON CONFLICT (id) DO UPDATE 
    SET 
      full_name = EXCLUDED.full_name,
      is_active = EXCLUDED.is_active;
  END IF;
END $$;

-- 3. Create Better-Auth "session" table
CREATE TABLE IF NOT EXISTS "session" (
  id              TEXT PRIMARY KEY,
  "expiresAt"     TIMESTAMPTZ NOT NULL,
  token           TEXT NOT NULL UNIQUE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"     TEXT,
  "userAgent"     TEXT,
  "userId"        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");

-- 4. Create Better-Auth "account" table
CREATE TABLE IF NOT EXISTS "account" (
  id                       TEXT PRIMARY KEY,
  "accountId"              TEXT NOT NULL,
  "providerId"             TEXT NOT NULL,
  "userId"                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"            TEXT,
  "refreshToken"           TEXT,
  "idToken"                TEXT,
  "accessTokenExpiresAt"   TIMESTAMPTZ,
  "refreshTokenExpiresAt"  TIMESTAMPTZ,
  scope                    TEXT,
  password                 TEXT,
  "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("providerId", "accountId")
);

CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");

-- 5. Create Better-Auth "verification" table
CREATE TABLE IF NOT EXISTS "verification" (
  id              TEXT PRIMARY KEY,
  identifier      TEXT NOT NULL,
  value           TEXT NOT NULL,
  "expiresAt"     TIMESTAMPTZ NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (identifier, value)
);

-- 6. Update applications table: link assigned_instructor to "user"(id)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'applications') THEN
    -- Drop old FK constraint if exists
    ALTER TABLE applications 
      DROP CONSTRAINT IF EXISTS applications_assigned_instructor_fkey;

    -- Add constraint pointing to user(id)
    ALTER TABLE applications
      ADD CONSTRAINT applications_assigned_instructor_fkey 
      FOREIGN KEY (assigned_instructor) REFERENCES "user"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Create "dossier_events" table for application audit trail / Historique
CREATE TABLE IF NOT EXISTS dossier_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL,
  user_id         TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  event_type      VARCHAR(50) NOT NULL, -- STATUS_CHANGE, COMPLEMENT_REQUEST, NOTE, ASSIGNMENT, VERIFICATION, DECISION
  description     TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key referencing applications(application_id) or applications(id)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'applications') THEN
    ALTER TABLE dossier_events
      DROP CONSTRAINT IF EXISTS fk_dossier_events_application;

    ALTER TABLE dossier_events
      ADD CONSTRAINT fk_dossier_events_application
      FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dossier_events_application ON dossier_events(application_id);
CREATE INDEX IF NOT EXISTS idx_dossier_events_created ON dossier_events(created_at DESC);

-- 8. Safely drop instructors table if it exists
DROP TABLE IF EXISTS instructors CASCADE;

COMMIT;
