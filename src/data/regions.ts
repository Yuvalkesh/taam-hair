// Region filter menu. Order = display order (north → south).
export const REGIONS = [
  'גליל',
  'צפון',
  'שרון',
  'מרכז',
  'תל אביב',
  'שפלה',
  'דרום',
] as const

export type Region = (typeof REGIONS)[number]

// Map center per region — used to fly the map when a region is picked.
export const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  גליל: { lat: 32.96, lng: 35.5, zoom: 11 },
  צפון: { lat: 33.13, lng: 35.55, zoom: 11 },
  שרון: { lat: 32.39, lng: 34.87, zoom: 11 },
  מרכז: { lat: 32.06, lng: 34.83, zoom: 12 },
  'תל אביב': { lat: 32.06, lng: 34.78, zoom: 13 },
  שפלה: { lat: 31.85, lng: 34.8, zoom: 11 },
  דרום: { lat: 31.5, lng: 34.75, zoom: 10 },
}
