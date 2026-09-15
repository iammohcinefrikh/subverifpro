-- 1. Ensure 'CONFORME' is part of public.application_status enum
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'CONFORME';

-- 2. Ensure compliance_rate column exists in applications
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS compliance_rate numeric(5, 2) NULL;

-- 3. Function to sync application status from compliance_checks
CREATE OR REPLACE FUNCTION public.sync_application_status_from_compliance()
RETURNS TRIGGER AS $func$
DECLARE
  new_app_status public.application_status;
  comp_rate numeric;
  missing_cnt integer;
BEGIN
  comp_rate := COALESCE(NEW.completeness_rate, 0);
  missing_cnt := COALESCE(NEW.missing_count, 0);

  IF comp_rate >= 100 OR (comp_rate > 0 AND missing_cnt = 0) THEN
    new_app_status := 'CONFORME'::public.application_status;
  ELSE
    new_app_status := 'INCOMPLETE'::public.application_status;
  END IF;

  UPDATE public.applications
  SET
    status = new_app_status,
    compliance_rate = comp_rate,
    documents = COALESCE(NEW.documents, documents),
    updated_at = NOW()
  WHERE application_id = NEW.application_id
     OR id = NEW.application_id
     OR (candidate_id IS NOT NULL AND NEW.candidate_id IS NOT NULL AND candidate_id = NEW.candidate_id);

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. Trigger on compliance_checks
DROP TRIGGER IF EXISTS trg_sync_application_status ON public.compliance_checks;
CREATE TRIGGER trg_sync_application_status
AFTER INSERT OR UPDATE ON public.compliance_checks
FOR EACH ROW
EXECUTE FUNCTION public.sync_application_status_from_compliance();

-- 5. Trigger on applications directly to enforce rule on compliance_rate update
CREATE OR REPLACE FUNCTION public.sync_applications_status_rule()
RETURNS TRIGGER AS $func$
BEGIN
  IF NEW.compliance_rate IS NOT NULL THEN
    IF NEW.status NOT IN ('ACCEPTED', 'REJECTED') THEN
      IF NEW.compliance_rate >= 100 THEN
        NEW.status := 'CONFORME'::public.application_status;
      ELSE
        NEW.status := 'INCOMPLETE'::public.application_status;
      END IF;
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_applications_status_rule ON public.applications;
CREATE TRIGGER trg_sync_applications_status_rule
BEFORE INSERT OR UPDATE OF compliance_rate, documents ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_applications_status_rule();

-- 6. Retro-sync all existing applications based on existing compliance_checks
DO $body$
DECLARE
  r RECORD;
  calc_status public.application_status;
BEGIN
  FOR r IN SELECT * FROM public.compliance_checks LOOP
    IF COALESCE(r.completeness_rate, 0) >= 100 OR (COALESCE(r.completeness_rate, 0) > 0 AND COALESCE(r.missing_count, 0) = 0) THEN
      calc_status := 'CONFORME'::public.application_status;
    ELSE
      calc_status := 'INCOMPLETE'::public.application_status;
    END IF;

    UPDATE public.applications
    SET
      status = calc_status,
      compliance_rate = COALESCE(r.completeness_rate, 0),
      documents = COALESCE(r.documents, documents),
      updated_at = NOW()
    WHERE application_id = r.application_id
       OR id = r.application_id
       OR (candidate_id IS NOT NULL AND r.candidate_id IS NOT NULL AND candidate_id = r.candidate_id);
  END LOOP;
END;
$body$;
