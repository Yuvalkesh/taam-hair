import { REGIONS } from '../data/regions'
import { CATEGORIES, emojiFor } from '../data/categories'

interface Props {
  region: string | null
  category: string | null
  view: 'map' | 'grid'
  onRegion: (r: string | null) => void
  onCategory: (c: string | null) => void
  onView: (v: 'map' | 'grid') => void
}

export default function FilterBar({
  region,
  category,
  view,
  onRegion,
  onCategory,
  onView,
}: Props) {
  return (
    <div className="filterbar">
      <div className="filter-row">
        <span className="filter-label">אזור:</span>
        <button
          className={`chip ${region === null ? 'active' : ''}`}
          onClick={() => onRegion(null)}
        >
          הכל
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            className={`chip ${region === r ? 'active' : ''}`}
            onClick={() => onRegion(region === r ? null : r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <span className="filter-label">סוג אוכל:</span>
        <button
          className={`chip ${category === null ? 'active-cat' : ''}`}
          onClick={() => onCategory(null)}
        >
          הכל
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            className={`chip ${category === c.name ? 'active-cat' : ''}`}
            onClick={() => onCategory(category === c.name ? null : c.name)}
          >
            {emojiFor(c.name)} {c.name}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <span className="filter-label">תצוגה:</span>
        <div className="viewtoggle">
          <button
            className={`chip ${view === 'map' ? 'active' : ''}`}
            onClick={() => onView('map')}
          >
            🗺️ מפה
          </button>
          <button
            className={`chip ${view === 'grid' ? 'active' : ''}`}
            onClick={() => onView('grid')}
          >
            ▦ רשימה
          </button>
        </div>
      </div>
    </div>
  )
}
