export interface AclRule {
  id: number
  action: 'Allow' | 'Deny'
  principal: string
  permission: string
}

export const url = (t: number) => `/api/settings/acl_rules?tenant_id=${t}`

export function parseRules(value: string | undefined): AclRule[] {
  try {
    return JSON.parse(value || '[]')
  } catch {
    return []
  }
}
