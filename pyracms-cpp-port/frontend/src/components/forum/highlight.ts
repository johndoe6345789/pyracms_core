import { sanitizeHtml } from '@/lib/sanitize'

const SPECIAL = /[.*+?^${}()|[\]\\]/g

/**
 * Highlights query matches in text. All output is sanitized
 * through DOMPurify before rendering to prevent XSS.
 */
export function highlightMatch(text: string, hl: string): string {
  if (!hl) return sanitizeHtml(text)
  const esc = hl.replace(SPECIAL, '\\$&')
  const re = new RegExp(`(${esc})`, 'gi')
  return sanitizeHtml(text.replace(re, '<mark>$1</mark>'))
}
