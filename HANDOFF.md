# HANDOFF PROMPT — build "טעם העיר" end to end

> Paste everything below the line into a fresh autonomous coding agent. It is fully
> self-contained: an agent can build, verify, and deploy the whole product from zero
> with no access to any prior repo.

---

You are an autonomous full-stack engineer. Build and ship a production web app called
**טעם העיר** ("Taste of the City"), end to end, then report the live URL. Work
independently; only stop to ask me for the 2 secrets/decisions explicitly listed at the
end. Make every other call yourself with sensible defaults. The whole UI is Hebrew, RTL.

## 0. Source repo (start here)
A working reference implementation of this exact app already exists on GitHub. Clone it and
build on top of it — do NOT start from an empty folder unless the clone fails.
- **Repo:** https://github.com/Yuvalkesh/taam-hair
- **Clone:** `git clone https://github.com/Yuvalkesh/taam-hair.git && cd taam-hair`
- **Run:** `npm install && npm run dev`  → http://localhost:5180
- It already contains the full app (Vite+React+TS, NES.css, Leaflet, all 24 seed places,
  cards/map/modal/reviews/add-form), plus `supabase/schema.sql`, `supabase/seed.mjs`,
  `.env.example`, and `README.md`. The remaining work is sections 4 (Supabase wiring) and 6
  (deploy) below, plus confirming the flagged places. If you must rebuild from scratch, this
  document fully specifies how. **Push your work back to this same repo** (`origin`,
  branch `main`) when done.

## 1. What it is
A **non-profit, retro pixel-game web app**: a shared, community-editable map of Israel's
old-school food gems — hole-in-the-wall places with "מחירים של פעם וטעם של פעם" (old
prices, old taste) that still hold the level. It was born from a viral Facebook post about
a 30-year schnitzel stand; dozens of people commented their own gems. This app collects
them so everyone can find and **add** more.

Mission line (start screen + footer):
> טעם העיר — פרויקט ללא מטרות רווח שנועד להציג את הפנינות הטעימות שקיימות בערי ארץ ישראל.
> מחירים של פעם. טעם של פעם. מקומות של פעם שעוד מחזיקים את הרמה.

## 2. Non-negotiable product decisions (already made — do not re-litigate)
- **Default view is CARDS** (a responsive grid of place cards), NOT the map. The map is an
  opt-in toggle only.
- Each place card → opens a detail modal with: short blurb, address, a **"פתח בגוגל מפות"**
  button (deep-link to the Google Maps listing), and a **reviews slider** (carousel of
  quote-cards).
- **Anyone can add a place** via a form; additions are saved to a **shared backend
  (Supabase)** so everyone sees them. Until Supabase keys exist, run on a bundled seed file
  and degrade gracefully (adds are device-local).
- **No paid APIs.** Map = Leaflet + free CartoDB dark tiles (no key). Geocoding new
  submissions = free OSM Nominatim (no key). Reviews = seeded quote-cards (NOT live Google).
- Filters: by **region** and by **food category**. Region also re-centers the map.

## 3. Aesthetic — old-school computer-game / retro pixel, experiential
- Pixel UI via **NES.css**. Full-screen **CRT scanline + vignette overlay** with subtle
  flicker. **Custom oversized pixel-arrow cursor** (SVG data-URI; a yellow variant on
  clickables). A **"PRESS START" splash screen** that enters the app on click.
- **Hebrew-font gotcha (critical):** Press Start 2P and most pixel fonts are Latin-only and
  WON'T render Hebrew. Use a hybrid: pixel font ("Press Start 2P") for Latin/numbers/chrome
  accents; a heavy readable Hebrew font ("Secular One" for titles, "Heebo" for body) for all
  Hebrew copy — wrapped in NES.css pixel borders + the CRT overlay so it still READS retro
  while staying legible. Whole document `dir="rtl"`, `lang="he"`.
- Palette: deep purple/navy bg (#1a1228 / #2d1b4e), arcade yellow (#ffd23f), phosphor green
  (#2bd96b), magenta (#ff4f9a), cyan (#38c5ff). Thick black borders + hard box-shadows.

## 4. Stack & structure
- **Vite + React + TypeScript** SPA. Deps: `react`, `react-dom`, `leaflet`, `react-leaflet`
  (v4), `nes.css`, `@supabase/supabase-js`. Dev deps: `vite`, `@vitejs/plugin-react`,
  `typescript`, `@types/*`.
- Data layer reads Supabase when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars are
  present, else falls back to a bundled `src/data/seed.json`. Map DB columns are snake_case
  (`google_maps_url`, `price_level`, `submitted_by`, `created_at`, `status`); app uses
  camelCase — map between them.
- Components: StartScreen, CrtOverlay, FilterBar (region chips + category chips + view
  toggle, CARDS first), PlaceGrid, PlaceModal, ReviewsSlider, MapView, AddPlaceDialog.
- **MapView gotcha:** Leaflet measures the container at mount and inside a flex column reads
  0 height → blank map. Add a child using `useMap()` that calls `map.invalidateSize()` on a
  ~50ms and ~300ms timer and on window resize. Markers are emoji `L.divIcon`s (no network).
  Tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`, given a CSS filter
  `contrast(1.05) saturate(1.3) hue-rotate(-12deg) brightness(1.15)`.
- **Deep-link URL params** (also user-shareable): `?app=1` (skip splash), `?view=grid|map`,
  `?place=<id>` (open a place), `?add=1` (open add form), `?admin=1` (also show `pending`).

## 5. Data model — Supabase table `places`
`id text pk · name text · city text · region text · category text · address text ·
description text · google_maps_url text · lat float8 · lng float8 · price_level text null ·
rating float8 null · submitted_by text null · reviews jsonb default '[]' ·
status text default 'approved' · created_at timestamptz default now()`.
RLS: public SELECT where `status='approved'`; public INSERT (with_check true); no public
UPDATE/DELETE. `rating` may be null — never fabricate a rating. `reviews` = array of
`{author, text}`. Build `google_maps_url` as
`https://www.google.com/maps/search/?api=1&query=<urlencoded "name city">`.

**Regions** (north→south, for the filter + map re-center): גליל · צפון · שרון · מרכז ·
תל אביב · שפלה · דרום.
**Categories** (with a pin emoji each): שניצל 🍗 · קבב 🥩 · שיפודים 🍢 · שווארמה 🌯 ·
פלאפל 🧆 · סביח 🍆 · תימני 🍲 · בורקס 🥟 · בשרים 🔥.

## 6. Seed data — 24 places (build `src/data/seed.json` from this)
Pull lat/lng by geocoding each address (Nominatim) at build time, or use city-center coords;
the Google Maps button always resolves the real listing regardless. Review `text` quotes
below are REAL comments from the source thread — keep them verbatim with the given author.
Places marked **(confirm)** have an unverified branch/city — seed them but tag them
`needsConfirm: true` and surface a small "לאישור" badge.

| # | name | city | region | category | ₪ | seed review (author) |
|---|------|------|--------|----------|---|----------------------|
| 1 | השניצל של תמיר | גבעתיים (צומת כורזין) | מרכז | שניצל | ₪ | "תמיר הוא 'מוסד' ואושיה בגבעתיים" (Ella Kône); "אחלה תמיר!! הכמויות ענקיות" (Harel Avrahami) |
| 2 | קיסר | תל אביב — התקווה (אצ"ל 43) | תל אביב | תימני | ₪₪ | "קבב על פחמים, פיתה עיראקית, טחינה ועמבה. מטבח מזרחי ביתי של פעם" |
| 3 | בוסי **(confirm)** | תל אביב — התקווה | תל אביב | בשרים | ₪₪ | — |
| 4 | התימני **(confirm)** | תל אביב — התקווה | תל אביב | תימני | ₪₪ | — |
| 5 | מגנדה **(confirm)** | תל אביב — כרם התימנים (רבי מאיר 26) | תל אביב | תימני | ₪₪₪ | — |
| 6 | סמי ובניו **(confirm city)** | בני ברק (בן גוריון 173) | מרכז | קבב | ₪₪ | "הקבב הכי טוב שיש במרכז" |
| 7 | פלאפל התאומים **(confirm city)** | בני ברק (בן גוריון 184) | מרכז | פלאפל | ₪ | "היה מתחת לבית שלי לתקופה, אחלה מוסד" (יוב קש); "טרי, מוניטין כבר 48 שנה" |
| 8 | הסביח של דודי **(confirm)** | תל אביב (הראה 129) | תל אביב | סביח | ₪ | — |
| 9 | מזנון סביח המקורי **(confirm)** | תל אביב (נגבה 16 פינת הראה) | תל אביב | סביח | ₪ | — |
| 10 | שווארמה ראש העיר | תל אביב (סלומון 2, ת"מ ישנה) | תל אביב | שווארמה | ₪₪ | "שווארמה 'ראש העיר' בתל אביב" (AlexYaMo) |
| 11 | אליקו | קרית מלאכי | דרום | שניצל | ₪ | "לא מפוצץ בשניצל, אבל טופ בגט שניצל בארץ" (malachi) |
| 12 | הבאגט של ערון | ראש העין | מרכז | שניצל | ₪ | "מפוצץ בשניצל ואחלה בגט, יש גם לחוח" (malachi) |
| 13 | הבוריק | גבעת אולגה | שרון | בורקס | ₪ | "2 דקות מאחד החופים היפים בארץ וטעים למות" (Tammy GR) |
| 14 | שיפודי אולגה (דובי וסימו) | גבעת אולגה | שרון | שיפודים | ₪₪₪ | "מקום מהמם, אבל בטווח המחירים הגבוה. מאוד גבוה" (Ariel Kedem) |
| 15 | פריקסה זהבה | צפת | גליל | בשרים | ₪₪ | — |
| 16 | הבן של שרוני | חצור הגלילית | גליל | בשרים | ₪₪ | — |
| 17 | הקבב של עובד | קרית שמונה | צפון | קבב | ₪₪ | — |
| 18 | סטקיית אלפסי | טבריה | גליל | בשרים | ₪₪ | — |
| 19 | סטקיית הקצבים | צפת | גליל | בשרים | ₪₪ | — |
| 20 | סלימי | תל אביב (נחלת בנימין) | תל אביב | בשרים | ₪₪ | "מסעדת פועלים של אוכל פרסי (מעולה), לא שניצל" (Erez Krispin) |
| 21 | עזרא ובניו | אזור | מרכז | בשרים | ₪₪ | — |
| 22 | שניצל איילה | נתניה | שרון | שניצל | ₪₪ | "אובררייטד שומני (דעה אישית)" (Emanuel Lustig) |
| 23 | הפינה הלבנה **(confirm city)** | (לאישור) | מרכז | בשרים | ₪₪ | "לאפה חצי קילו בשר לפחות. מקום של פעם" (Do Ron) |
| 24 | סביח עובד **(confirm)** | גבעתיים | מרכז | סביח | ₪ | — |

Give each a short Hebrew `description` (1–2 sentences, old-school energy). Place 1's blurb:
"דוכן שמטגן מעל 30 שנה. ב-50 ש\"ח בגט עם הר שניצל שמאכיל משפחה שלמה, צ'יפס מפנק, ואם יצא קר
מביאים מנה חדשה בלי פרצוף. מקום של פעם בקטע הכי טוב שיש."

## 7. Add-a-place form (AddPlaceDialog)
Pixel form. Fields: שם המקום*, עיר*, אזור* (select from regions), סוג אוכל* (select from
categories), כתובת, לינק לגוגל מפות (optional — auto-build if blank), תיאור, טווח מחירים
(₪/₪₪/₪₪₪), הביקורת שלכם (optional → becomes first review), השם שלכם (optional → review
author). On submit: validate the 4 required fields → geocode (address, city) via Nominatim
(fallback to central TLV if it fails) → build a unique id → insert into Supabase (if
configured) AND prepend to local state so it shows immediately. Show a "מאתר על המפה…"
loading state during geocode.

## 8. Build order
1. Scaffold Vite+React+TS; install deps; wire NES.css + Leaflet CSS + Google Fonts (Press
   Start 2P, Secular One, Heebo); RTL; CRT overlay; pixel cursor.
2. Build the local app on `seed.json`: StartScreen → cards grid (default) + map toggle +
   region/category filters + PlaceModal + ReviewsSlider. Verify it runs offline.
3. Add-a-place flow with Nominatim geocoding (local state first).
4. Wire Supabase: create `supabase/schema.sql` (table + RLS above), a `supabase/seed.mjs`
   node script that upserts seed.json via the anon key, point reads/writes at Supabase.
5. Polish: responsive/mobile, RTL correctness, empty states, `?admin=1` view for spam.
6. Commit + push to `https://github.com/Yuvalkesh/taam-hair` (`main`). Deploy as a static
   site by connecting that GitHub repo to **Render** or **Vercel** (auto-deploy on push):
   build command `npm run build`, publish dir `dist`, set the two `VITE_SUPABASE_*` env vars
   in the host. Verify the live URL serves 200 and the app works.

## 9. Verification (do all)
- `npm run build` is clean (tsc + vite).
- Fresh load shows the splash; clicking enters the **cards** view by default.
- All 24 pins/cards render; region + category filters work; map toggle shows tiles + emoji
  pins over Gush Dan (confirm `invalidateSize` fixed any blank map).
- A place modal opens with the Google Maps button (resolves the real listing) + reviews
  slider scrolling.
- Adding a test place geocodes, appears immediately, and (with Supabase) persists on reload
  and in a second browser.
- Deep-links `?view=grid`, `?place=<id>`, `?add=1` all work.

## 10. Stop and ask me ONLY for these
1. **Supabase** Project URL + anon key (or tell me to create the project). Without them, ship
   in seed-mode and clearly note adds are device-local until wired.
2. **The (confirm) places** — exact name/branch/city for: מגנדה (כרם התימנים), סביח עובד
   (גבעתיים), בוסי + התימני (התקווה), סמי ובניו + פלאפל התאומים (city for בן גוריון 173/184),
   הפינה הלבנה (city). Seed them flagged; don't invent details.

Everything else: decide and proceed. Deliver the live URL when done.
