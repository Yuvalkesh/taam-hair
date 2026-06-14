// Seed the Supabase `places` table from src/data/seed.json.
// Usage:
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node supabase/seed.mjs
// (reads the same env vars the app uses; anon key is enough since insert is public)

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.')
  process.exit(1)
}

const seed = JSON.parse(readFileSync(join(__dirname, '../src/data/seed.json'), 'utf8'))
const rows = seed.map((p) => ({
  id: p.id,
  name: p.name,
  city: p.city,
  region: p.region,
  category: p.category,
  address: p.address,
  description: p.description,
  google_maps_url: p.googleMapsUrl,
  lat: p.lat,
  lng: p.lng,
  price_level: p.priceLevel ?? null,
  rating: p.rating ?? null,
  submitted_by: p.submittedBy ?? null,
  reviews: p.reviews ?? [],
  status: 'approved',
}))

const supabase = createClient(url, key)
const { error } = await supabase.from('places').upsert(rows, { onConflict: 'id' })
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log(`Seeded ${rows.length} places into Supabase.`)
