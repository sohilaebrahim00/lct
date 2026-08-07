# LCT Universal – Standard Vite Migration

This copy has been migrated from the Lovable TanStack Start runtime to a standard Vite + React SPA.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Important

- The broken `@lovable.dev/vite-tanstack-config` dependency was removed.
- File-based routing remains powered by TanStack Router.
- Existing Supabase environment variables are preserved.
- Form submissions now write directly through the Supabase browser client. Email sending that previously depended on TanStack Start server functions is not included in this SPA build and should be moved to a Supabase Edge Function or another backend before production.
- Lovable-hosted asset URLs were replaced with the real local images available in the export, so the site renders locally without `/__l5e/` asset failures.
