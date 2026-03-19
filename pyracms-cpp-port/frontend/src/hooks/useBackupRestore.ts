'use client'

import { useState, useRef } from 'react'

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'warning'
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function useBackupRestore() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportSettings = () => {
    const settingsData = {
      exportType: 'settings',
      exportedAt: new Date().toISOString(),
      data: {
        site_name: 'PyraCMS',
        site_description: 'A modern multi-tenant CMS',
        max_upload_size: '10485760',
        default_language: 'en',
        smtp_host: 'smtp.example.com',
        smtp_port: '587',
        registration_enabled: 'true',
      },
    }
    downloadJson(settingsData, 'pyracms-settings-export.json')
    setSnackbar({ open: true, message: 'Settings exported successfully.', severity: 'success' })
  }

  const handleExportMenus = () => {
    const menusData = {
      exportType: 'menus',
      exportedAt: new Date().toISOString(),
      data: [
        {
          name: 'main',
          items: [
            { name: 'Home', route: '/', position: 0, permissions: 'public' },
            { name: 'Articles', route: '/articles', position: 1, permissions: 'public' },
            { name: 'Forum', route: '/forum', position: 2, permissions: 'authenticated' },
          ],
        },
        {
          name: 'footer',
          items: [
            { name: 'About', route: '/about', position: 0, permissions: 'public' },
            { name: 'Contact', route: '/contact', position: 1, permissions: 'public' },
          ],
        },
      ],
    }
    downloadJson(menusData, 'pyracms-menus-export.json')
    setSnackbar({ open: true, message: 'Menus exported successfully.', severity: 'success' })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (!parsed.exportType || !parsed.data) {
          throw new Error('Invalid format')
        }
        setSnackbar({
          open: true,
          message: `Successfully imported ${parsed.exportType} data.`,
          severity: 'success',
        })
      } catch {
        setSnackbar({
          open: true,
          message: 'Invalid JSON file. Please use a PyraCMS export file.',
          severity: 'warning',
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
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
