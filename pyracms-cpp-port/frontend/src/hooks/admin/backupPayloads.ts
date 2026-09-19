import type { Setting } from './settingsApi'
import type { MenuGroup } from './menuData'
import { putSetting } from './settingsApi'

/** Downloads an object as a formatted JSON file. */
export function downloadJson(data: object, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Builds the settings export payload from real settings. */
export function buildSettingsPayload(settings: Setting[]) {
  const data: Record<string, string> = {}
  for (const s of settings) data[s.key] = s.value
  return {
    exportType: 'settings',
    exportedAt: new Date().toISOString(),
    data,
  }
}

/** Builds the menus export payload from real menu groups. */
export function buildMenusPayload(groups: MenuGroup[]) {
  return {
    exportType: 'menus',
    exportedAt: new Date().toISOString(),
    data: groups.map((g) => ({
      name: g.name,
      items: g.items.map(({ name, route, position, permissions }) =>
        ({ name, route, position, permissions })),
    })),
  }
}

export interface ParsedImport {
  exportType: string
  data: unknown
}

/** Parses and validates an import file. */
export function parseImport(text: string): ParsedImport {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object'
    || !parsed.exportType || !parsed.data) {
    throw new Error('Invalid format')
  }
  return parsed
}

/** Writes imported settings to the tenant; returns the count. */
export async function applySettings(
  data: unknown,
  tenantId: number,
): Promise<number> {
  const entries = Object.entries(
    (data && typeof data === 'object' ? data : {}) as object)
  for (const [key, value] of entries) {
    await putSetting(key, String(value), tenantId)
  }
  return entries.length
}
