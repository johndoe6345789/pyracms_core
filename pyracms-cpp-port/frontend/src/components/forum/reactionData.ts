export interface Reaction {
  emoji: string
  label: string
  count: number
  reacted: boolean
}

export const REACTIONS = [
  { emoji: '👍', label: 'thumbsup' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '🤔', label: 'thinking' },
  { emoji: '🙏', label: 'pray' },
  { emoji: '🚀', label: 'rocket' },
  { emoji: '👀', label: 'eyes' },
  { emoji: '🎉', label: 'party' },
]

export const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: '👍', label: 'thumbsup', count: 3, reacted: false },
  { emoji: '❤️', label: 'heart', count: 1, reacted: true },
]

/** Returns the reaction list after toggling one emoji. */
export function toggleReaction(
  list: Reaction[], emoji: string, label: string,
): Reaction[] {
  const ex = list.find((r) => r.emoji === emoji)
  if (!ex) return [...list, { emoji, label, count: 1, reacted: true }]
  if (!ex.reacted) {
    return list.map((r) =>
      r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r)
  }
  const n = ex.count - 1
  return n <= 0
    ? list.filter((r) => r.emoji !== emoji)
    : list.map((r) =>
      r.emoji === emoji ? { ...r, count: n, reacted: false } : r)
}
