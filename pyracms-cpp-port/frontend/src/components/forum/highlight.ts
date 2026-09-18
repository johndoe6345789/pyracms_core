import DOMPurify from 'dompurify'

const SPECIAL = /[.*+?^${}()|[\]\\]/g

/**
 * Highlights query matches in text. All output is sanitized
 * through DOMPurify before rendering to prevent XSS.
 */
export function highlightMatch(text: string, hl: string): string {
  if (!hl) return DOMPurify.sanitize(text)
  const esc = hl.replace(SPECIAL, '\\$&')
  const re = new RegExp(`(${esc})`, 'gi')
  return DOMPurify.sanitize(text.replace(re, '<mark>$1</mark>'))
}
