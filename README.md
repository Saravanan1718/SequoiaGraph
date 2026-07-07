# KinGraph — Family Tree on a Leaflet Canvas

Interactive family tree app. Leaflet (with `L.CRS.Simple`) acts as an infinite,
draggable graph canvas — members are markers on fake coordinates, relationships
are canvas-rendered lines.

**Stack:** Vue 3 (Composition API, JS) · Vite · TailwindCSS v4 · Pinia · Leaflet · Supabase · Netlify

## Quick start

```bash
npm install
npm run dev
```

Without Supabase credentials the app runs in **local mode** (persists to
localStorage) so you can try it immediately.

## Supabase setup

1. Create a project at supabase.com.
2. Run [supabase/schema.sql](supabase/schema.sql) in the SQL editor.
3. Copy `.env.example` to `.env` and fill in your URL + anon key.

## Data model

- `members` — person + graph position (`pos_x`, `pos_y`).
- `relationships` — **one directed row** per edge:
  - `parent` / `adopted` / `guardian`: `from_id` is the parent-figure, `to_id` the child.
  - `spouse`: symmetric, one row per couple.
  - **Siblings are derived** (shared parent), never stored.

## Architecture

Feature-based modules; dependency direction is `map / search → family → core`.
All Leaflet code lives inside `features/map`; all Supabase code behind
`features/family/services`. Coordinate conversion happens only in
`features/map/utils/graphCoords.js`.

```
src/
  app/        bootstrap, router, global styles
  core/       supabase client, config
  shared/     UI kit, generic composables/utils, JSDoc typedefs
  features/
    family/   domain: members + relationships (store, services, forms, kinship)
    map/      presentation: Leaflet canvas (markers, edges, selection, layout)
    search/   name search + jump-to
    settings/ theme
```

Saves are optimistic and auto: store mutates immediately, a coalescing save
queue (`family/services/saveQueue.js`) debounces per-entity writes with retry.

## Deploy

Push to a Git repo, connect it in Netlify — `netlify.toml` handles build and
SPA redirects. Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in Netlify
environment variables.
