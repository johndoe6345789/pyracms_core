'use client'

import { useState, useRef } from 'react'
import {
  downloadJson, buildSettingsPayload, buildMenusPayload,
  parseImport,
} from './admin/backupPayloads'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'warning'
}

/**
 * Hook that manages backup export and import operations,
 * including snackbar feedback and hidden file input handling.
 * @returns State values and handlers for the backup UI.
 */
export function useBackupRestore() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const notify = (
    message: string,
    severity: SnackbarState['severity'] = 'success',
  ) => setSnackbar({ open: true, message, severity })

  const handleExportSettings = () => {
    downloadJson(
      buildSettingsPayload(),
      'pyracms-settings-export.json',
    )
    notify('Settings exported successfully.')
  }

  const handleExportMenus = () => {
    downloadJson(buildMenusPayload(), 'pyracms-menus-export.json')
    notify('Menus exported successfully.')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      notify('File is too large to import.', 'warning')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        notify(parseImport(event.target?.result as string))
      } catch {
        notify(
          'Invalid JSON file. ' +
            'Please use a PyraCMS export file.',
          'warning',
        )
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return {
    snackbar, fileInputRef,
    handleExportSettings, handleExportMenus,
    handleImportClick, handleFileChange, handleCloseSnackbar,
  }
}
