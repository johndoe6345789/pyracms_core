/** Extracts the tenant slug from a /site/<slug>/... pathname. */
export function slugFromPath(path: string | null): string | null {
  const m = (path ?? '').match(/^\/site\/([^/]+)/)
  return m?.[1] ?? null
}
