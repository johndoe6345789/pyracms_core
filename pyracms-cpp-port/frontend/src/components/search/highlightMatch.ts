import DOMPurify from 'dompurify'

export function highlightMatch(text: string, highlight: string) {
  if (!highlight) return text
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return DOMPurify.sanitize(
    text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>'),
  )
}
