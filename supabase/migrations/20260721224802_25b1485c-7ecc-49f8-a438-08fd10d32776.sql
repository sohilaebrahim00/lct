
DROP POLICY IF EXISTS "Anyone can submit a form" ON public.form_submissions;

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
  );
