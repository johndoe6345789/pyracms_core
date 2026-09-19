export interface Reaction {
  emoji: string
  label: string
  count: number
  reacted: boolean
}

/** Server-side reaction keys, each with the glyph shown for it. */
export const REACTIONS = [
  { emoji: '👍', label: 'thumbs_up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '😮', label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '🎉', label: 'party' },
]

export interface RawReaction {
  emoji: string
  count: number
  mine?: boolean
}

/** Maps the API's {emoji: key, count, mine} rows to displayable badges. */
export function mapReactions(raw?: RawReaction[] | null): Reaction[] {
  const out: Reaction[] = []
  for (const opt of REACTIONS) {
    const r = (raw ?? []).find((x) => x.emoji === opt.label)
    if (r && r.count > 0) {
      out.push({ ...opt, count: r.count, reacted: Boolean(r.mine) })
    }
  }
  return out
}

/** Returns the reaction list after toggling one emoji. */
export function toggleReaction(
  list: Reaction[],
  emoji: string,
  label: string,
): Reaction[] {
  const ex = list.find((r) => r.emoji === emoji)
  if (!ex) return [...list, { emoji, label, count: 1, reacted: true }]
  if (!ex.reacted) {
    return list.map((r) =>
      r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r,
    )
  }
  const n = ex.count - 1
  return n <= 0
    ? list.filter((r) => r.emoji !== emoji)
    : list.map((r) =>
        r.emoji === emoji ? { ...r, count: n, reacted: false } : r,
      )
}
