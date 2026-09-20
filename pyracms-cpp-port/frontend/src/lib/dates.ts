/**
 * The calendar day (`YYYY-MM-DD`) of a timestamp from the API. The server
 * sends `2026-09-20 20:52:32+01` in some places and `2026-09-20T20:52:32Z`
 * in others, so splitting on `T` left the whole time on screen.
 */
export function dayOf(value: unknown): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(typeof value === 'string' ? value : '')
  return m?.[1] ?? ''
}
