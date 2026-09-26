import { fetchSettings, putSetting } from '@/hooks/admin/settingsApi'
import { attempt } from './pages'
import { emptyOutcome, type SectionDef } from './types'

interface Row {
  key: string
  value: string
}

export const settingsSection: SectionDef = {
  key: 'settings',
  label: 'Settings & theme',
  description: 'Every site setting, including features and light/dark themes.',
  async collect(tenantId) {
    const all = await fetchSettings(tenantId)
    return all.map(({ key, value }): Row => ({ key, value }))
  },
  async restore(rows, tenantId, progress) {
    const out = emptyOutcome()
    for (const r of rows as Row[]) {
      progress(`Setting ${r.key}`)
      const ok = await attempt(out.failed, r.key, () =>
        putSetting(r.key, String(r.value), tenantId).then(() => undefined),
      )
      if (ok) out.updated++
    }
    return out
  },
}
