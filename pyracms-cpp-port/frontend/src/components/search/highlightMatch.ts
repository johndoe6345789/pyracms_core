import { sanitizeHtml } from '@/lib/sanitize'

/** Wraps matches in <mark>; output is always sanitized HTML. */
export function highlightMatch(text: string, highlight: string) {
  if (!highlight) return sanitizeHtml(text)
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return sanitizeHtml(
    text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>'),
  )
}
