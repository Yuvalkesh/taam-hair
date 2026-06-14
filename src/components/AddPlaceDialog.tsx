import { useState } from 'react'
import { REGIONS } from '../data/regions'
import { CATEGORIES } from '../data/categories'
import { geocode, buildGoogleMapsUrl } from '../lib/geocode'
import type { Place } from '../lib/types'

interface Props {
  onClose: () => void
  onAdd: (place: Place) => Promise<void>
}

const PRICES = ['₪', '₪₪', '₪₪₪']

function slugify(name: string): string {
  const base = name.trim().replace(/\s+/g, '-').slice(0, 40)
  return `${base}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`
}

export default function AddPlaceDialog({ onClose, onAdd }: Props) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [address, setAddress] = useState('')
  const [gmaps, setGmaps] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [firstReview, setFirstReview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !city.trim() || !region || !category) {
      setError('צריך לפחות שם, עיר, אזור וסוג אוכל.')
      return
    }
    setLoading(true)
    try {
      const coords = await geocode(address.trim(), city.trim())
      const place: Place = {
        id: slugify(name),
        name: name.trim(),
        city: city.trim(),
        region,
        category,
        address: address.trim() || city.trim(),
        description: description.trim() || 'פנינה חדשה שנוספה על ידי הקהילה.',
        googleMapsUrl: gmaps.trim() || buildGoogleMapsUrl(name.trim(), city.trim()),
        lat: coords.lat,
        lng: coords.lng,
        priceLevel: price || null,
        rating: null,
        submittedBy: submittedBy.trim() || null,
        reviews: firstReview.trim()
          ? [{ author: submittedBy.trim() || 'אנונימי', text: firstReview.trim() }]
          : [],
      }
      await onAdd(place)
      onClose()
    } catch (err) {
      setError('משהו השתבש. נסו שוב.')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">הוסיפו פנינה 🍴</h2>
          <button className="nes-btn is-error" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>
        <p className="field hint" style={{ marginTop: '0.4rem' }}>
          מקום של פעם שעוד מחזיק את הרמה? תזרקו אותו פנימה. כולם יראו אותו על המפה.
        </p>

        <form className={`form-grid ${loading ? 'is-loading' : ''}`} onSubmit={handleSubmit}>
          <div className="field">
            <label>שם המקום *</label>
            <input
              className="nes-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השניצל של תמיר"
            />
          </div>

          <div className="field">
            <label>עיר *</label>
            <input
              className="nes-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="גבעתיים"
            />
          </div>

          <div className="field">
            <label>אזור *</label>
            <select
              className="select-pixel"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">בחרו אזור…</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>סוג אוכל *</label>
            <select
              className="select-pixel"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">בחרו סוג…</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>כתובת</label>
            <input
              className="nes-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="צומת כורזין"
            />
            <span className="hint">נשתמש בזה כדי לסמן את המקום על המפה.</span>
          </div>

          <div className="field">
            <label>לינק לגוגל מפות</label>
            <input
              className="nes-input"
              value={gmaps}
              onChange={(e) => setGmaps(e.target.value)}
              placeholder="(אופציונלי — נבנה חיפוש אוטומטית אם תשאירו ריק)"
              dir="ltr"
            />
          </div>

          <div className="field">
            <label>תיאור / למה זה פנינה</label>
            <textarea
              className="nes-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="מקום של פעם, מחירים של פעם, כמויות ענק…"
            />
          </div>

          <div className="field">
            <label>טווח מחירים</label>
            <select
              className="select-pixel"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            >
              <option value="">לא משנה</option>
              {PRICES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>הביקורת שלכם</label>
            <textarea
              className="nes-textarea"
              value={firstReview}
              onChange={(e) => setFirstReview(e.target.value)}
              rows={2}
              placeholder="(אופציונלי) ספרו מה אכלתם ולמה זה מנצח"
            />
          </div>

          <div className="field">
            <label>השם שלכם</label>
            <input
              className="nes-input"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="(אופציונלי)"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="nes-btn is-success" disabled={loading}>
              {loading ? 'מאתר על המפה…' : 'הוסיפו את הפנינה'}
            </button>
            <button type="button" className="nes-btn" onClick={onClose} disabled={loading}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
