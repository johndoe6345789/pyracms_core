export type SectionKey =
  'settings' | 'menu' | 'articles' | 'snippets' | 'albums'

/** What a restore did to one section. */
export interface Outcome {
  created: number
  updated: number
  skipped: number
  failed: string[]
}

export type Progress = (message: string) => void

export interface SectionDef {
  key: SectionKey
  label: string
  description: string
  /** Reads the section from the site. */
  collect: (tenantId: number, progress: Progress) => Promise<unknown[]>
  /** Writes a backed-up section back into the site. */
  restore: (
    rows: unknown[],
    tenantId: number,
    progress: Progress,
  ) => Promise<Outcome>
}

export interface BackupFile {
  format: 'pyracms-backup'
  version: 2
  exportedAt: string
  sections: Partial<Record<SectionKey, unknown[]>>
}

export const emptyOutcome = (): Outcome => ({
  created: 0,
  updated: 0,
  skipped: 0,
  failed: [],
})
