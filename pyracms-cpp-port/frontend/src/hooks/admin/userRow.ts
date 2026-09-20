export interface UserRow {
  id: number
  username: string
  fullName: string
  email: string
  created: string
  banned: boolean
  /** Numeric UserRole; Normal User when the API does not say. */
  role: number
  /** Owns the site (tenants.owner_id); treated as an Administrator. */
  siteOwner?: boolean | undefined
  /** Last active Administrator-or-owner of the site. */
  lastAdmin?: boolean | undefined
}

/** Maps a raw API user record to a UserRow. */
export function mapUser(u: Record<string, unknown>): UserRow {
  const created = u.createdAt
  return {
    id: u.id as number,
    username: (u.username as string) || '',
    fullName: (u.fullName as string) || '',
    email: (u.email as string) || '',
    created: typeof created === 'string' ? (created.split('T')[0] ?? '') : '',
    banned: (u.banned as boolean) || false,
    role: typeof u.role === 'number' ? u.role : 1,
    siteOwner: u.siteOwner === true,
    lastAdmin: u.lastAdmin === true,
  }
}
