// Free geocoding via OpenStreetMap's Nominatim. No key required.
// Usage policy: <=1 req/sec, a real referer/UA. Fine for one-off "add a place".

export interface GeoResult {
  lat: number
  lng: number
}

const TLV_FALLBACK: GeoResult = { lat: 32.0759, lng: 34.7753 }

export async function geocode(address: string, city: string): Promise<GeoResult> {
  const q = [address, city, 'ישראל'].filter(Boolean).join(', ')
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=il&q=' +
    encodeURIComponent(q)
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'he' },
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = (await res.json()) as Array<{ lat: string; lon: string }>
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err)
  }
  // Couldn't resolve — drop the pin on central TLV so it still shows up,
  // and the place's Google Maps link still points to the real spot.
  return TLV_FALLBACK
}

export function buildGoogleMapsUrl(name: string, city: string): string {
  const query = `${name} ${city}`.trim()
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)
}
