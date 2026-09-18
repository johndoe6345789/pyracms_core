/** Parse "YYYY-MM-DD HH:MM:SS+TZ" style timestamps. */
export function parseApiDate(raw: string): Date {
  return new Date(
    raw.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')
  )
}

export function formatDay(raw: string): string {
  if (!raw) return ''
  return parseApiDate(raw).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(raw: string): string {
  return parseApiDate(raw).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
