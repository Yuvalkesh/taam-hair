import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Place } from '../lib/types'
import { emojiFor } from '../data/categories'
import { REGION_CENTERS } from '../data/regions'

function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div class="pin">${emoji}</div>`,
    className: 'pin-wrap',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

// Flies the map to a region's center when the region filter changes.
function FlyTo({ region }: { region: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (region && REGION_CENTERS[region]) {
      const c = REGION_CENTERS[region]
      map.flyTo([c.lat, c.lng], c.zoom, { duration: 0.8 })
    } else {
      map.flyTo([31.7, 34.9], 7, { duration: 0.8 })
    }
  }, [region, map])
  return null
}

// Leaflet measures the container at mount; inside a flex column it can read 0
// height and request no tiles. Force a re-measure once layout settles.
function InvalidateOnMount() {
  const map = useMap()
  useEffect(() => {
    const fix = () => map.invalidateSize()
    const t1 = setTimeout(fix, 50)
    const t2 = setTimeout(fix, 300)
    window.addEventListener('resize', fix)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', fix)
    }
  }, [map])
  return null
}

interface Props {
  places: Place[]
  region: string | null
  onSelect: (p: Place) => void
}

export default function MapView({ places, region, onSelect }: Props) {
  const icons = useMemo(() => {
    const cache: Record<string, L.DivIcon> = {}
    return (cat: string) => (cache[cat] ??= emojiIcon(emojiFor(cat)))
  }, [])

  return (
    <div className="map-wrap">
      <MapContainer
        center={[31.7, 34.9]}
        zoom={7}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          className="retro-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <InvalidateOnMount />
        <FlyTo region={region} />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icons(p.category)}>
            <Popup>
              <div className="popup-title">
                {emojiFor(p.category)} {p.name}
              </div>
              <div className="popup-meta">
                {p.city} · {p.category}
                {p.priceLevel ? ` · ${p.priceLevel}` : ''}
              </div>
              <button
                className="nes-btn is-primary"
                style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}
                onClick={() => onSelect(p)}
              >
                פרטים וביקורות
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
