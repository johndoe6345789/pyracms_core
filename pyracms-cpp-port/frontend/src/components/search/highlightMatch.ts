import DOMPurify from 'dompurify'

/** Wraps matches in <mark>; output is always sanitized HTML. */
export function highlightMatch(text: string, highlight: string) {
  if (!highlight) return DOMPurify.sanitize(text)
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return DOMPurify.sanitize(
    text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>'),
  )
}
