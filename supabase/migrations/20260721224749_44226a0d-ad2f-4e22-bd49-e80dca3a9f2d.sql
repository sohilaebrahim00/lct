
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  additional_stops TEXT,
  trip_type TEXT,
  pickup_datetime TIMESTAMPTZ,
  return_datetime TIMESTAMPTZ,
  passengers INTEGER,
  luggage INTEGER,
  vehicle_preference TEXT,
  flight_number TEXT,
  airline TEXT,
  meet_and_greet BOOLEAN DEFAULT FALSE,
  corporate_booking BOOLEAN DEFAULT FALSE,
  special_requests TEXT,
  source_page TEXT,
  submission_hash TEXT,
  ip_hash TEXT,
  company_email_status TEXT NOT NULL DEFAULT 'pending',
  company_email_error TEXT,
  customer_email_status TEXT NOT NULL DEFAULT 'pending',
  customer_email_error TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_submissions_created_at ON public.form_submissions (created_at DESC);
CREATE INDEX idx_form_submissions_form_type ON public.form_submissions (form_type);
CREATE INDEX idx_form_submissions_status ON public.form_submissions (status);
CREATE UNIQUE INDEX idx_form_submissions_hash ON public.form_submissions (submission_hash) WHERE submission_hash IS NOT NULL;

GRANT INSERT ON public.form_submissions TO anon, authenticated;
GRANT ALL ON public.form_submissions TO service_role;

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a form"
  ON public.form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
