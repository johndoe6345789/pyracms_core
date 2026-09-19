import api from '@/lib/api'

export interface Setting {
  id: number
  key: string
  value: string
}

/** Maps a raw API record to a Setting. */
function mapSetting(s: Record<string, unknown>): Setting {
  return {
    id: s.id as number,
    key: (s.name as string) || '',
    value: (s.value as string) || '',
  }
}

const settingUrl = (key: string, tenantId: number | null) =>
  `/api/settings/${key}?tenant_id=${tenantId}`

export const fetchSettings = (tenantId: number) =>
  api
    .get(`/api/settings?tenant_id=${tenantId}`)
    .then((res) => (res.data || []).map(mapSetting) as Setting[])

export const putSetting = (
  key: string,
  value: string,
  tenantId: number | null,
) => api.put(settingUrl(key, tenantId), { name: key, value, tenantId })

export const deleteSetting = (
  key: string,
  tenantId: number | null,
) => api.delete(settingUrl(key, tenantId), { data: { tenantId } })
