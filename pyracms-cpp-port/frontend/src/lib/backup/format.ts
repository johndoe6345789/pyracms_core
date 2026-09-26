import type { BackupFile, SectionKey } from './types'
import { SECTIONS } from './sections'

const KEYS = SECTIONS.map((s) => s.key)

export const MAX_BACKUP_BYTES = 50 * 1024 * 1024

/** Files written before whole-site backups held one kind of data. */
function fromLegacy(p: { exportType: string; data: unknown }): BackupFile {
  const sections: BackupFile['sections'] = {}
  if (p.exportType === 'settings') {
    const data = (p.data ?? {}) as Record<string, unknown>
    sections.settings = Object.entries(data).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  } else if (p.exportType === 'menus') {
    const groups = (Array.isArray(p.data) ? p.data : []) as {
      name: string
      items: object[]
    }[]
    sections.menu = groups.flatMap((g) =>
      g.items.map((i) => ({
        type: 'route',
        parent: '',
        icon: '',
        ...i,
        group: g.name,
      })),
    )
  } else {
    throw new Error('Unknown backup type')
  }
  return { format: 'pyracms-backup', version: 2, exportedAt: '', sections }
}

/** Parses a backup file (current or legacy); throws when it is not one. */
export function parseBackup(text: string): BackupFile {
  const p = JSON.parse(text)
  if (p?.format === 'pyracms-backup' && p.sections) {
    const sections: BackupFile['sections'] = {}
    for (const k of KEYS)
      if (Array.isArray(p.sections[k])) sections[k] = p.sections[k]
    return { ...p, sections }
  }
  if (typeof p?.exportType === 'string') return fromLegacy(p)
  throw new Error('Not a PyraCMS backup')
}

/** Builds the file for the chosen sections' collected rows. */
export function buildBackup(
  sections: Partial<Record<SectionKey, unknown[]>>,
): BackupFile {
  return {
    format: 'pyracms-backup',
    version: 2,
    exportedAt: new Date().toISOString(),
    sections,
  }
}
