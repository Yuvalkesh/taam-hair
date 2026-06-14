# טעם העיר 🍴 — Israeli Food Gems Map

פרויקט ללא מטרות רווח שנועד להציג את הפנינות הטעימות שקיימות בערי ארץ ישראל.
מחירים של פעם. טעם של פעם. מקומות של פעם שעוד מחזיקים את הרמה.

A retro pixel-game web app: a shared map of Israel's old-school food gems. Browse by
map / region / food type, read review quotes, jump to the place on Google Maps, and
**add your own gem** — everyone sees it.

## Stack
- Vite + React + TypeScript
- Leaflet + CartoDB dark tiles (free, no key) · Nominatim geocoding (free, no key)
- NES.css pixel UI + CRT overlay + custom pixel cursor
- Supabase (Postgres) shared backend — optional; falls back to a bundled seed file offline

## Run locally
```bash
npm install
npm run dev          # → http://localhost:5180
```
Runs fully on `src/data/seed.json` (24 seeded places) with no backend.

## Connect the shared backend (Supabase)
1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` → `.env` and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
3. Seed the table:
   ```bash
   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node supabase/seed.mjs
   ```
4. `npm run dev` — the app now reads/writes the shared DB. Added places persist for everyone.

## URL deep-links (also handy for sharing)
- `/?app=1` — skip the start screen
- `/?view=grid` or `/?view=map`
- `/?place=<id>` — open a specific place
- `/?add=1` — open the "add a place" form
- `/?admin=1` — also show `pending` places (when moderation is on)

## Build & deploy
```bash
npm run build        # → dist/  (static site)
```
Deploy `dist/` as a static site (Render / Vercel / Netlify). Set the two `VITE_SUPABASE_*`
env vars in the host. Build command `npm run build`, publish dir `dist`.
