import type { Place } from '../lib/types'
import { emojiFor } from '../data/categories'

interface Props {
  places: Place[]
  onSelect: (p: Place) => void
}

export default function PlaceGrid({ places, onSelect }: Props) {
  if (places.length === 0) {
    return (
      <div className="grid">
        <div className="empty-state">
          לא נמצאו מקומות בסינון הזה. נסו אזור או סוג אוכל אחר — או הוסיפו פנינה חדשה!
        </div>
      </div>
    )
  }

  return (
    <div className="grid">
      {places.map((p) => (
        <div
          key={p.id}
          className="place-card clickable"
          onClick={() => onSelect(p)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(p)}
        >
          <div className="pc-emoji">{emojiFor(p.category)}</div>
          <div className="pc-name">{p.name}</div>
          <div className="pc-city">{p.city}</div>
          <div className="pc-desc">{p.description}</div>
          <div className="pc-tags">
            <span className="tag">{p.category}</span>
            {p.priceLevel && <span className="tag price">{p.priceLevel}</span>}
            {p.needsConfirm && <span className="tag confirm">לאישור</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
