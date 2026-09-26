import { buildBackup } from './format'
import { sectionByKey } from './sections'
import type { BackupFile, Outcome, Progress, SectionKey } from './types'

/** Collects the chosen sections from the site into a backup file. */
export async function runBackup(
  keys: SectionKey[],
  tenantId: number,
  progress: Progress,
): Promise<BackupFile> {
  const sections: BackupFile['sections'] = {}
  for (const k of keys) {
    sections[k] = await sectionByKey(k).collect(tenantId, progress)
  }
  return buildBackup(sections)
}

/** Restores the chosen sections; one failing item never stops the rest. */
export async function runRestore(
  file: BackupFile,
  keys: SectionKey[],
  tenantId: number,
  progress: Progress,
): Promise<Partial<Record<SectionKey, Outcome>>> {
  const report: Partial<Record<SectionKey, Outcome>> = {}
  for (const k of keys) {
    report[k] = await sectionByKey(k).restore(
      file.sections[k] ?? [],
      tenantId,
      progress,
    )
  }
  return report
}
