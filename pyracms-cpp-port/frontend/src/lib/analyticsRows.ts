/** Mappers from the analytics API to what the admin charts and tables show. */

export type Period = 'day' | 'week' | 'month'
type Row = Record<string, unknown>

export interface ViewPoint {
  date: string
  views: number
}
export interface Referrer {
  source: string
  visits: number
  percentage: number
}
export interface SearchTerm {
  query: string
  count: number
}

const num = (v: unknown) => Number(v) || 0
const text = (v: unknown) => (typeof v === 'string' ? v : '')

/** "2026-09-20 00:00:00+01" -> a label for the chosen period (UTC date). */
export function dateLabel(raw: unknown, period: Period): string {
  const d = new Date(`${text(raw).slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return text(raw)
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en', { ...o, timeZone: 'UTC' }).format(d)
  if (period === 'month') return fmt({ month: 'short', year: 'numeric' })
  const day = fmt({ month: 'short', day: 'numeric' })
  return period === 'week' ? `Week of ${day}` : day
}

export function mapPageViews(rows: Row[], period: Period): ViewPoint[] {
  return rows.map((r) => ({
    date: dateLabel(r.date, period),
    views: num(r.count),
  }))
}

/** Visits with their share of all recorded visits; no referrer = Direct. */
export function mapReferrers(rows: Row[]): Referrer[] {
  const total = rows.reduce((sum, r) => sum + num(r.count), 0)
  return rows.map((r) => ({
    source: text(r.referrer).trim() || 'Direct',
    visits: num(r.count),
    percentage: total ? Math.round((num(r.count) / total) * 1000) / 10 : 0,
  }))
}

export function mapSearches(rows: Row[]): SearchTerm[] {
  return rows
    .map((r) => ({ query: text(r.query), count: num(r.count) }))
    .filter((r) => r.query)
}
