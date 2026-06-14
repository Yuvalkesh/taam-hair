import type { Place } from '../lib/types'
import { emojiFor } from '../data/categories'
import ReviewsSlider from './ReviewsSlider'

interface Props {
  place: Place
  onClose: () => void
}

export default function PlaceModal({ place, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">
              {emojiFor(place.category)} {place.name}
            </h2>
            <div className="modal-city">
              {place.city} · {place.region}
            </div>
          </div>
          <button className="nes-btn is-error" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>

        <div className="modal-row" style={{ marginTop: '0.8rem' }}>
          <span className="tag">{emojiFor(place.category)} {place.category}</span>
          {place.priceLevel && <span className="tag price">{place.priceLevel}</span>}
          {place.needsConfirm && <span className="tag confirm">לאישור פרטים</span>}
        </div>

        <p className="modal-desc">{place.description}</p>

        <div className="modal-row">
          <span className="tag">📍 {place.address}</span>
        </div>

        <div className="modal-row">
          <a
            className="nes-btn is-primary gmaps-btn"
            href={place.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            📍 פתח בגוגל מפות
          </a>
        </div>

        <ReviewsSlider reviews={place.reviews} />
      </div>
    </div>
  )
}
