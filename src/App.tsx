import { useEffect, useMemo, useState } from 'react'
import type { Place } from './lib/types'
import { fetchPlaces, insertPlace, isRemote } from './lib/supabase'
import CrtOverlay from './components/CrtOverlay'
import StartScreen from './components/StartScreen'
import FilterBar from './components/FilterBar'
import MapView from './components/MapView'
import PlaceGrid from './components/PlaceGrid'
import PlaceModal from './components/PlaceModal'
import AddPlaceDialog from './components/AddPlaceDialog'

const params = new URLSearchParams(window.location.search)
const isAdmin = params.get('admin') === '1'
// Deep-link straight into the app (skip start screen): ?app=1 or ?view=grid|map
const deepLinked =
  params.has('app') || params.has('view') || params.has('place') || params.get('add') === '1'
const initialView: 'map' | 'grid' = params.get('view') === 'grid' ? 'grid' : 'map'

export default function App() {
  const [started, setStarted] = useState(deepLinked)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [view, setView] = useState<'map' | 'grid'>(initialView)
  const [selected, setSelected] = useState<Place | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    fetchPlaces(isAdmin)
      .then((rows) => {
        setPlaces(rows)
        // deep-link to a specific place: ?place=<id>
        const pid = params.get('place')
        if (pid) {
          const hit = rows.find((p) => p.id === pid)
          if (hit) setSelected(hit)
        }
        if (params.get('add') === '1') setShowAdd(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (region === null || p.region === region) &&
          (category === null || p.category === category),
      ),
    [places, region, category],
  )

  async function handleAdd(place: Place) {
    const persisted = await insertPlace(place)
    setPlaces((prev) => [place, ...prev])
    if (!persisted && isRemote) {
      // remote configured but insert failed — surfaced in console; still show locally
      console.warn('Place shown locally only (remote insert failed).')
    }
  }

  if (!started) {
    return (
      <>
        <CrtOverlay />
        <StartScreen onStart={() => setStarted(true)} placeCount={places.length} />
      </>
    )
  }

  return (
    <>
      <CrtOverlay />
      <div className="app-shell">
        <header className="topbar">
          <div>
            <h1>טעם העיר</h1>
            <div className="tagline">הפנינות הטעימות של ארץ ישראל · מחירים של פעם, טעם של פעם</div>
          </div>
          <div className="topbar-actions">
            <span className="count-pill">{filtered.length} מקומות</span>
            <button className="nes-btn is-warning" onClick={() => setShowAdd(true)}>
              ＋ הוסיפו פנינה
            </button>
          </div>
        </header>

        <FilterBar
          region={region}
          category={category}
          view={view}
          onRegion={setRegion}
          onCategory={setCategory}
          onView={setView}
        />

        {loading ? (
          <div className="empty-state" style={{ padding: '4rem' }}>
            טוען פנינות…
          </div>
        ) : view === 'map' ? (
          <MapView places={filtered} region={region} onSelect={setSelected} />
        ) : (
          <PlaceGrid places={filtered} onSelect={setSelected} />
        )}

        <footer className="footer">
          טעם העיר · פרויקט ללא מטרות רווח · {places.length} פנינות ועוד באות
          {!isRemote && ' · (מצב מקומי — חיבור למסד משותף בקרוב)'}
          <br />
          מכירים עוד מקום של פעם שמחזיק את הרמה? הוסיפו אותו ☝️
        </footer>
      </div>

      {selected && <PlaceModal place={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddPlaceDialog onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </>
  )
}
