'use client'

import { useRef } from 'react'
import { parseImport, applySettings } from './backupPayloads'
import type { Notify } from './useBackupNotify'

type Run = (label: string, task: (id: number) => Promise<void>) => Promise<void>

/** Hidden-file-input handling and restore of settings exports. */
export function useBackupImport(notify: Notify, run: Run) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const importText = async (text: string) => {
    let parsed
    try {
      parsed = parseImport(text)
    } catch {
      return notify(
        'Invalid JSON file. ' + 'Please use a PyraCMS export file.',
        'warning',
      )
    }
    if (parsed.exportType !== 'settings') {
      return notify(
        'Importing ' +
          parsed.exportType +
          ' is not available yet. Only settings can be restored.',
        'warning',
      )
    }
    await run('import settings', async (id) => {
      const n = await applySettings(parsed.data, id)
      notify(`Imported ${n} settings.`)
    })
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      notify('File is too large to import.', 'warning')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => importText(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return { fileInputRef, handleImportClick, handleFileChange }
}
