'use client'

import { useState } from 'react'
import { downloadJson } from '@/lib/backup/download'
import { MAX_BACKUP_BYTES, parseBackup } from '@/lib/backup/format'
import { readText } from '@/lib/backup/readText'
import { runBackup, runRestore } from '@/lib/backup/run'
import { SECTIONS } from '@/lib/backup/sections'
import type { BackupFile, Outcome, SectionKey } from '@/lib/backup/types'
import { useBackupTask } from './useBackupTask'
import { useKeySet } from './useKeySet'

const ALL = SECTIONS.map((s) => s.key)

/**
 * Whole-site backup and restore for one tenant.
 * @param tenantId Site being backed up or restored.
 * @param slug Site name used in the downloaded file's name.
 */
export function useSiteBackup(tenantId: number | null, slug: string) {
  const task = useBackupTask()
  const exportSet = useKeySet(ALL)
  const restoreSet = useKeySet([])
  const [file, setFile] = useState<BackupFile | null>(null)
  const [report, setReport] = useState<Partial<Record<SectionKey, Outcome>>>({})
  const [done, setDone] = useState('')

  const exportNow = () =>
    tenantId == null
      ? undefined
      : task.run('create the backup', async () => {
          const data = await runBackup(
            exportSet.keys,
            tenantId,
            task.setProgress,
          )
          const day = new Date().toISOString().slice(0, 10)
          downloadJson(data, `pyracms-${slug}-backup-${day}.json`)
          setDone('Backup downloaded.')
        })

  const load = async (f: File) => {
    setReport({})
    setDone('')
    task.setError('')
    if (f.size > MAX_BACKUP_BYTES) return task.setError('That file is too big.')
    try {
      const parsed = parseBackup(await readText(f))
      setFile(parsed)
      restoreSet.setKeys(ALL.filter((k) => parsed.sections[k]))
    } catch {
      setFile(null)
      task.setError('That is not a PyraCMS backup file.')
    }
  }

  const restoreNow = () =>
    tenantId == null || !file
      ? undefined
      : task.run('restore the backup', async () => {
          setReport(
            await runRestore(file, restoreSet.keys, tenantId, task.setProgress),
          )
          setDone('Restore finished.')
        })

  return {
    task,
    exportSet,
    restoreSet,
    file,
    report,
    done,
    exportNow,
    load,
    restoreNow,
  }
}
