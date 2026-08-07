-- Production hardening for public.form_submissions (Phase 3 security pass).
--
-- 1) Server-side rate limiting: the anon/authenticated roles only ever have
--    INSERT on this table (no SELECT) — see prior migration — so a BEFORE
--    INSERT trigger is the correct place to enforce "not too many requests
--    from the same person too fast" regardless of what the client does.
--    SECURITY DEFINER is required here: the trigger body needs to COUNT
--    existing rows to know the recent rate, but the anon role invoking the
--    INSERT has no SELECT grant on this table, so the function must run
--    with the definer's privileges to read what it needs while still never
--    exposing that data back to the caller (it only returns NEW or raises).
CREATE OR REPLACE FUNCTION public.enforce_form_submission_rate_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.form_submissions
  WHERE customer_email = NEW.customer_email
    AND created_at > now() - INTERVAL '10 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: too many submissions from this email recently'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS form_submissions_rate_limit ON public.form_submissions;
CREATE TRIGGER form_submissions_rate_limit
  BEFORE INSERT ON public.form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_form_submission_rate_limit();

-- 2) Tighten the existing RLS CHECK with sane upper bounds on the fields the
--    client already sends as free text, so an oversized payload is rejected
--    at the database layer even if client-side validation is bypassed.
DROP POLICY IF EXISTS "Anyone can submit a valid form" ON public.form_submissions;

CREATE POLICY "Anyone can submit a valid form"
  ON public.form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(customer_name)) BETWEEN 2 AND 200
    AND length(trim(customer_email)) BETWEEN 5 AND 320
    AND customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND form_type IN (
      'contact','quote','booking','corporate','airport','event','fleet','service_inquiry'
    )
    AND (phone IS NULL OR length(phone) <= 40)
    AND (company_name IS NULL OR length(company_name) <= 200)
    AND (pickup_address IS NULL OR length(pickup_address) <= 500)
    AND (dropoff_address IS NULL OR length(dropoff_address) <= 500)
    AND (additional_stops IS NULL OR length(additional_stops) <= 1000)
    AND (special_requests IS NULL OR length(special_requests) <= 2000)
    AND (vehicle_preference IS NULL OR length(vehicle_preference) <= 200)
    AND (flight_number IS NULL OR length(flight_number) <= 40)
    AND (airline IS NULL OR length(airline) <= 100)
    AND (source_page IS NULL OR length(source_page) <= 200)
    AND (passengers IS NULL OR passengers BETWEEN 0 AND 200)
    AND (luggage IS NULL OR luggage BETWEEN 0 AND 200)
  );
