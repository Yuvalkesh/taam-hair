// Food-type filter. Each carries a pixel emoji used on the map pin + chips.
export interface CategoryDef {
  name: string
  emoji: string
}

export const CATEGORIES: CategoryDef[] = [
  { name: 'שניצל', emoji: '🍗' },
  { name: 'קבב', emoji: '🥩' },
  { name: 'שיפודים', emoji: '🍢' },
  { name: 'שווארמה', emoji: '🌯' },
  { name: 'פלאפל', emoji: '🧆' },
  { name: 'סביח', emoji: '🍆' },
  { name: 'תימני', emoji: '🍲' },
  { name: 'בורקס', emoji: '🥟' },
  { name: 'בשרים', emoji: '🔥' },
]

export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.emoji]),
)

export function emojiFor(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🍴'
}
