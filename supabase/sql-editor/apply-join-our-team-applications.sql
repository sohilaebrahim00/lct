-- =============================================================================
-- SAFE-TO-PASTE VERSION of migration 20260811200635_join_our_team_applications.sql
-- for the Supabase Dashboard SQL Editor.
--
-- This is the exact same DDL as the versioned migration file, wrapped in a
-- single transaction with IF NOT EXISTS / DROP-then-CREATE guards so it is
-- safe even if accidentally run twice, or if part of it was already applied.
-- The versioned migration file remains the source of truth for `supabase db
-- push` — this file exists only for a manual paste-and-run.
--
-- HOW TO RUN:
--   1. Open your Supabase project dashboard → SQL Editor → New query.
--   2. Paste this entire file.
--   3. Click "Run".
--   4. Expected result: "Success. No rows returned" (all statements are DDL).
--   5. Then run the separate verification queries at the bottom of this
--      file (or see VERIFY.sql) to confirm everything was created correctly.
--
-- If it fails partway through, the whole transaction rolls back (BEGIN/COMMIT
-- below) — nothing is left half-created. Read the error, fix it, re-run.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Driver Application
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  felony_conviction TEXT NOT NULL,
  dui_past_5_years TEXT NOT NULL,
  chauffeur_experience TEXT NOT NULL,
  headshot_path TEXT NOT NULL,
  license_front_path TEXT NOT NULL,
  license_back_path TEXT NOT NULL,
  transportation_license_path TEXT,
  certification_consent BOOLEAN NOT NULL DEFAULT FALSE,
  background_check_consent BOOLEAN NOT NULL DEFAULT FALSE,
  screening_notice_ack BOOLEAN NOT NULL DEFAULT FALSE,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  employment_terms_ack BOOLEAN NOT NULL DEFAULT FALSE,
  source_page TEXT,
  client_token TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_driver_applications_created_at ON public.driver_applications (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_applications_client_token ON public.driver_applications (client_token) WHERE client_token IS NOT NULL;

GRANT INSERT ON public.driver_applications TO anon, authenticated;
GRANT ALL ON public.driver_applications TO service_role;

ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a valid driver application" ON public.driver_applications;
CREATE POLICY "Anyone can submit a valid driver application"
  ON public.driver_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 200
    AND length(trim(email)) BETWEEN 5 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(phone)) BETWEEN 7 AND 40
    AND felony_conviction IN ('Yes', 'No')
    AND dui_past_5_years IN ('Yes', 'No')
    AND chauffeur_experience IN ('Less than 1 year', '1-3 years', '3-5 years', '5+ years')
    AND length(headshot_path) > 0 AND length(headshot_path) <= 500
    AND length(license_front_path) > 0 AND length(license_front_path) <= 500
    AND length(license_back_path) > 0 AND length(license_back_path) <= 500
    AND (transportation_license_path IS NULL OR length(transportation_license_path) <= 500)
    AND certification_consent = TRUE
    AND background_check_consent = TRUE
    AND screening_notice_ack = TRUE
    AND data_consent = TRUE
    AND employment_terms_ack = TRUE
    AND (street_address IS NULL OR length(street_address) <= 300)
    AND (city IS NULL OR length(city) <= 120)
    AND (state IS NULL OR length(state) <= 120)
    AND (country IS NULL OR length(country) <= 120)
    AND (postal_code IS NULL OR length(postal_code) <= 20)
    AND (source_page IS NULL OR length(source_page) <= 200)
  );

DROP TRIGGER IF EXISTS update_driver_applications_updated_at ON public.driver_applications;
CREATE TRIGGER update_driver_applications_updated_at
BEFORE UPDATE ON public.driver_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2) Company Partner Application
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  company_email TEXT,
  company_phone TEXT,
  website TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  years_operating TEXT,
  active_drivers TEXT,
  fleet_vehicle_count TEXT,
  fleet_description TEXT,
  suit_requirement TEXT,
  business_license_path TEXT,
  operating_permit_path TEXT,
  ein_letter_path TEXT,
  insurance_cert_path TEXT,
  certification_ack BOOLEAN NOT NULL DEFAULT FALSE,
  no_partnership_disclaimer_ack BOOLEAN NOT NULL DEFAULT FALSE,
  contact_consent_ack BOOLEAN NOT NULL DEFAULT FALSE,
  source_page TEXT,
  client_token TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_partner_applications_created_at ON public.company_partner_applications (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_partner_applications_client_token ON public.company_partner_applications (client_token) WHERE client_token IS NOT NULL;

GRANT INSERT ON public.company_partner_applications TO anon, authenticated;
GRANT ALL ON public.company_partner_applications TO service_role;

ALTER TABLE public.company_partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a valid company partner application" ON public.company_partner_applications;
CREATE POLICY "Anyone can submit a valid company partner application"
  ON public.company_partner_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 200
    AND length(trim(email)) BETWEEN 5 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(phone)) BETWEEN 7 AND 40
    AND (job_title IS NULL OR length(job_title) <= 150)
    AND (company_name IS NULL OR length(company_name) <= 200)
    AND (company_email IS NULL OR length(company_email) <= 320)
    AND (company_phone IS NULL OR length(company_phone) <= 40)
    AND (website IS NULL OR length(website) <= 300)
    AND (street_address IS NULL OR length(street_address) <= 300)
    AND (city IS NULL OR length(city) <= 120)
    AND (state IS NULL OR length(state) <= 120)
    AND (country IS NULL OR length(country) <= 120)
    AND (postal_code IS NULL OR length(postal_code) <= 20)
    AND (years_operating IS NULL OR years_operating IN ('Less than 1 year', '1-3 years', '3-5 years', '5+ years'))
    AND (active_drivers IS NULL OR length(active_drivers) <= 20)
    AND (fleet_vehicle_count IS NULL OR length(fleet_vehicle_count) <= 20)
    AND (fleet_description IS NULL OR length(fleet_description) <= 2000)
    AND (suit_requirement IS NULL OR suit_requirement IN ('Yes - Always', 'Yes - Upon request', 'No'))
    AND (business_license_path IS NULL OR length(business_license_path) <= 500)
    AND (operating_permit_path IS NULL OR length(operating_permit_path) <= 500)
    AND (ein_letter_path IS NULL OR length(ein_letter_path) <= 500)
    AND (insurance_cert_path IS NULL OR length(insurance_cert_path) <= 500)
    AND certification_ack = TRUE
    AND no_partnership_disclaimer_ack = TRUE
    AND contact_consent_ack = TRUE
    AND (source_page IS NULL OR length(source_page) <= 200)
  );

DROP TRIGGER IF EXISTS update_company_partner_applications_updated_at ON public.company_partner_applications;
CREATE TRIGGER update_company_partner_applications_updated_at
BEFORE UPDATE ON public.company_partner_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3) Referral Partner Application
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  applicant_type TEXT NOT NULL,
  company_brand_name TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,
  other_platform TEXT,
  referral_method TEXT NOT NULL,
  estimated_referrals TEXT NOT NULL,
  preferred_payment TEXT,
  agreement_ack_1 BOOLEAN NOT NULL DEFAULT FALSE,
  agreement_ack_2 BOOLEAN NOT NULL DEFAULT FALSE,
  source_page TEXT,
  client_token TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_partner_applications_created_at ON public.referral_partner_applications (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_partner_applications_client_token ON public.referral_partner_applications (client_token) WHERE client_token IS NOT NULL;

GRANT INSERT ON public.referral_partner_applications TO anon, authenticated;
GRANT ALL ON public.referral_partner_applications TO service_role;

ALTER TABLE public.referral_partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a valid referral partner application" ON public.referral_partner_applications;
CREATE POLICY "Anyone can submit a valid referral partner application"
  ON public.referral_partner_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 200
    AND length(trim(email)) BETWEEN 5 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(phone)) BETWEEN 7 AND 40
    AND length(trim(country)) BETWEEN 2 AND 120
    AND length(trim(city)) BETWEEN 2 AND 120
    AND applicant_type IN ('Influencer', 'Social Media Marketer', 'Sales Professional', 'Business Consultant', 'Transportation Industry Contact', 'Other')
    AND (company_brand_name IS NULL OR length(company_brand_name) <= 200)
    AND (website IS NULL OR length(website) <= 300)
    AND (instagram IS NULL OR length(instagram) <= 200)
    AND (facebook IS NULL OR length(facebook) <= 200)
    AND (linkedin IS NULL OR length(linkedin) <= 200)
    AND (other_platform IS NULL OR length(other_platform) <= 200)
    AND length(trim(referral_method)) BETWEEN 2 AND 2000
    AND estimated_referrals IN ('1-3', '3-10', '10+')
    AND (preferred_payment IS NULL OR preferred_payment IN ('Zelle', 'ACH', 'PayPal', 'Wire Transfer'))
    AND (source_page IS NULL OR length(source_page) <= 200)
  );

DROP TRIGGER IF EXISTS update_referral_partner_applications_updated_at ON public.referral_partner_applications;
CREATE TRIGGER update_referral_partner_applications_updated_at
BEFORE UPDATE ON public.referral_partner_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 4) Shared rate limiter (max 3 applications per email per 10 minutes,
--    same policy already used for customer form_submissions)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_application_rate_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE email = $1 AND created_at > now() - INTERVAL ''10 minutes''',
    TG_TABLE_NAME
  ) INTO recent_count USING NEW.email;

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: too many applications from this email recently'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS driver_applications_rate_limit ON public.driver_applications;
CREATE TRIGGER driver_applications_rate_limit
  BEFORE INSERT ON public.driver_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_application_rate_limit();

DROP TRIGGER IF EXISTS company_partner_applications_rate_limit ON public.company_partner_applications;
CREATE TRIGGER company_partner_applications_rate_limit
  BEFORE INSERT ON public.company_partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_application_rate_limit();

DROP TRIGGER IF EXISTS referral_partner_applications_rate_limit ON public.referral_partner_applications;
CREATE TRIGGER referral_partner_applications_rate_limit
  BEFORE INSERT ON public.referral_partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_application_rate_limit();

-- ---------------------------------------------------------------------------
-- 5) Private storage bucket for application documents
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applications',
  'applications',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'text/csv']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can upload an application document" ON storage.objects;
CREATE POLICY "Anyone can upload an application document"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'applications'
    AND (storage.foldername(name))[1] IN ('driver', 'company-partner')
  );

-- No SELECT/UPDATE/DELETE policy for anon/authenticated is created
-- deliberately — uploaded documents are write-only from the client's
-- perspective; only service_role (Supabase dashboard) can read them back.

COMMIT;

-- =============================================================================
-- Expected result after running the block above:
--   "Success. No rows returned"
-- If you see an error instead, nothing was committed (the whole block is one
-- transaction) — read the error message and re-run after fixing it.
-- =============================================================================
