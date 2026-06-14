import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import seed from '../data/seed.json'
import type { Place } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isRemote = Boolean(url && anonKey)

const client: SupabaseClient | null = isRemote ? createClient(url!, anonKey!) : null

// --- row <-> Place mapping (DB columns are snake_case) ---------------------
interface PlaceRow {
  id: string
  name: string
  city: string
  region: string
  category: string
  address: string
  description: string
  google_maps_url: string
  lat: number
  lng: number
  price_level: string | null
  rating: number | null
  submitted_by: string | null
  reviews: Place['reviews'] | null
  status?: string
}

function rowToPlace(r: PlaceRow): Place {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    region: r.region,
    category: r.category,
    address: r.address,
    description: r.description,
    googleMapsUrl: r.google_maps_url,
    lat: Number(r.lat),
    lng: Number(r.lng),
    priceLevel: r.price_level,
    rating: r.rating,
    submittedBy: r.submitted_by,
    reviews: r.reviews ?? [],
  }
}

export function placeToRow(p: Place): PlaceRow {
  return {
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
    reviews: p.reviews,
    status: 'approved',
  }
}

const seedPlaces = seed as Place[]

/** Read all approved places. Falls back to the bundled seed file when offline. */
export async function fetchPlaces(includePending = false): Promise<Place[]> {
  if (!client) return seedPlaces
  let query = client.from('places').select('*').order('created_at', { ascending: false })
  if (!includePending) query = query.eq('status', 'approved')
  const { data, error } = await query
  if (error) {
    console.warn('Supabase fetch failed, using seed:', error.message)
    return seedPlaces
  }
  return (data as PlaceRow[]).map(rowToPlace)
}

/** Insert a place. Returns true if it was persisted remotely, false if local-only. */
export async function insertPlace(place: Place): Promise<boolean> {
  if (!client) return false
  const { error } = await client.from('places').insert(placeToRow(place))
  if (error) {
    console.warn('Supabase insert failed:', error.message)
    return false
  }
  return true
}
