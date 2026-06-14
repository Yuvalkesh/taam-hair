import { useState } from 'react'
import type { Review } from '../lib/types'

export default function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0)

  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews">
        <h4>מה אומרים</h4>
        <div className="review-empty">
          עוד אין ביקורות כאן. אתם הראשונים שאכלו? ספרו לנו בתגובות 🙂
        </div>
      </div>
    )
  }

  const prev = () => setI((i - 1 + reviews.length) % reviews.length)
  const next = () => setI((i + 1) % reviews.length)
  const r = reviews[i]

  return (
    <div className="reviews">
      <h4>מה אומרים ({reviews.length})</h4>
      <div className="slider">
        {reviews.length > 1 && (
          <button className="nes-btn" onClick={prev} aria-label="הקודם">
            ‹
          </button>
        )}
        <div className="slider-track">
          <div className="review-card">
            <div className="review-text">"{r.text}"</div>
            <div className="review-author">— {r.author}</div>
          </div>
        </div>
        {reviews.length > 1 && (
          <button className="nes-btn" onClick={next} aria-label="הבא">
            ›
          </button>
        )}
      </div>
      {reviews.length > 1 && (
        <div className="slider-dots">
          {reviews.map((_, k) => (
            <span key={k} className={`dot ${k === i ? 'on' : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
