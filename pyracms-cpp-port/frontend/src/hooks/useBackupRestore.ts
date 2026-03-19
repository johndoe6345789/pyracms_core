'use client'

import { useState, useRef } from 'react'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'warning'
}

/**
 * Downloads an object as a formatted JSON file.
 * @param data - The data to serialize.
 * @param filename - The download file name.
 */
function downloadJson(
  data: object,
  filename: string
) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Builds the stub settings export payload.
 * @returns An object ready for JSON download.
 */
function buildSettingsPayload() {
  return {
    exportType: 'settings',
    exportedAt: new Date().toISOString(),
    data: {
      site_name: 'PyraCMS',
      site_description:
        'A modern multi-tenant CMS',
      max_upload_size: '10485760',
      default_language: 'en',
      smtp_host: 'smtp.example.com',
      smtp_port: '587',
      registration_enabled: 'true',
    },
  }
}

/**
 * Builds the stub menus export payload.
 * @returns An object ready for JSON download.
 */
function buildMenusPayload() {
  return {
    exportType: 'menus',
    exportedAt: new Date().toISOString(),
    data: [
      {
        name: 'main',
        items: [
          {
            name: 'Home',
            route: '/',
            position: 0,
            permissions: 'public',
          },
          {
            name: 'Articles',
            route: '/articles',
            position: 1,
            permissions: 'public',
          },
          {
            name: 'Forum',
            route: '/forum',
            position: 2,
            permissions: 'authenticated',
          },
        ],
      },
      {
        name: 'footer',
        items: [
          {
            name: 'About',
            route: '/about',
            position: 0,
            permissions: 'public',
          },
          {
            name: 'Contact',
            route: '/contact',
            position: 1,
            permissions: 'public',
          },
        ],
      },
    ],
  }
}

/**
 * Hook that manages backup export and import
 * operations, including snackbar feedback and
 * hidden file input handling.
 * @returns State values and handler functions
 *   for the backup/restore UI.
 */
export function useBackupRestore() {
  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success',
    })
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  /**
   * Exports site settings as a JSON file
   * download.
   */
  const handleExportSettings = () => {
    const payload = buildSettingsPayload()
    downloadJson(
      payload,
      'pyracms-settings-export.json'
    )
    setSnackbar({
      open: true,
      message: 'Settings exported successfully.',
      severity: 'success',
    })
  }

  /**
   * Exports menu structure as a JSON file
   * download.
   */
  const handleExportMenus = () => {
    const payload = buildMenusPayload()
    downloadJson(
      payload,
      'pyracms-menus-export.json'
    )
    setSnackbar({
      open: true,
      message: 'Menus exported successfully.',
      severity: 'success',
    })
  }

  /** Triggers the hidden file input click. */
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Reads and validates a selected JSON import
   * file, showing success or error feedback.
   * @param e - The file input change event.
   */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(
          event.target?.result as string
        )
        if (!parsed.exportType || !parsed.data) {
          throw new Error('Invalid format')
        }
        const msg =
          `Successfully imported ` +
          `${parsed.exportType} data.`
        setSnackbar({
          open: true,
          message: msg,
          severity: 'success',
        })
      } catch {
        setSnackbar({
          open: true,
          message:
            'Invalid JSON file. ' +
            'Please use a PyraCMS export file.',
          severity: 'warning',
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  /** Closes the snackbar notification. */
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }))
  }

  return {
    snackbar,
    fileInputRef,
    handleExportSettings,
    handleExportMenus,
    handleImportClick,
    handleFileChange,
    handleCloseSnackbar,
  }
}
