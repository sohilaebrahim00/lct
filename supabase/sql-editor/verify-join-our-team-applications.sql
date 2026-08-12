-- =============================================================================
-- Run AFTER apply-join-our-team-applications.sql to confirm everything was
-- created correctly. Paste and run each block separately in the SQL Editor
-- (or all at once — each is a plain SELECT, safe to run repeatedly).
-- =============================================================================

-- 1) Confirm all 3 tables exist.
-- Expected: 3 rows — driver_applications, company_partner_applications,
-- referral_partner_applications.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('driver_applications', 'company_partner_applications', 'referral_partner_applications')
ORDER BY table_name;

-- 2) Confirm Row Level Security is enabled on all 3 tables.
-- Expected: 3 rows, rowsecurity = true for all.
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('driver_applications', 'company_partner_applications', 'referral_partner_applications')
  AND relnamespace = 'public'::regnamespace;

-- 3) Confirm each table has exactly one INSERT-only policy for anon/authenticated
-- (no SELECT/UPDATE/DELETE policy should exist for anon/authenticated — that's
-- what keeps applications unreadable by the public).
-- Expected: 3 rows, cmd = INSERT, roles containing anon and authenticated.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('driver_applications', 'company_partner_applications', 'referral_partner_applications')
ORDER BY tablename;

-- 4) Confirm the shared rate-limit trigger is attached to all 3 tables.
-- Expected: 3 rows.
SELECT event_object_table AS table_name, trigger_name
FROM information_schema.triggers
WHERE trigger_name LIKE '%_rate_limit'
  AND event_object_table IN ('driver_applications', 'company_partner_applications', 'referral_partner_applications')
ORDER BY table_name;

-- 5) Confirm the 'applications' storage bucket exists and is PRIVATE.
-- Expected: 1 row, public = false, file_size_limit = 10485760.
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'applications';

-- 6) Confirm the storage upload policy exists and only allows INSERT
-- (no anon/authenticated SELECT policy should exist on storage.objects for
-- this bucket — that's what keeps uploaded files unreadable by the public).
-- Expected: 1 row, cmd = INSERT.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname = 'Anyone can upload an application document';

-- 7) Confirm no public READ policy exists anywhere on these 4 objects
-- (3 tables + storage.objects) for anon/authenticated. This query should
-- return ZERO rows — if it returns any row, something is more open than
-- intended and should be investigated before going live.
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE (
    (schemaname = 'public' AND tablename IN ('driver_applications', 'company_partner_applications', 'referral_partner_applications'))
    OR (schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload an application document')
  )
  AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  AND (roles::text LIKE '%anon%' OR roles::text LIKE '%authenticated%');
