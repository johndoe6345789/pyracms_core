/** Query params scoping a gamedep call to a site (anonymous callers). */
export function tenantParams(tenantId: number | null) {
  return tenantId == null ? undefined : { tenant_id: tenantId }
}
