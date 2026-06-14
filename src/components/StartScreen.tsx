interface Props {
  onStart: () => void
  placeCount: number
}

export default function StartScreen({ onStart, placeCount }: Props) {
  return (
    <div
      className="start-screen clickable"
      onClick={onStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStart()}
    >
      <h1 className="start-logo">טעם העיר</h1>
      <div className="start-sub">★ ISRAELI FOOD GEMS ★</div>
      <p className="start-mission">
        פרויקט ללא מטרות רווח שנועד להציג את הפנינות הטעימות שקיימות בערי ארץ ישראל.
        <br />
        מחירים של פעם. טעם של פעם. מקומות של פעם שעוד מחזיקים את הרמה.
      </p>
      <div className="start-press">
        <span className="blink">▶</span> לחצו כדי להתחיל
      </div>
      <div className="start-credit">
        {placeCount} פנינות על המפה · הוסיפו את שלכם
      </div>
    </div>
  )
}
