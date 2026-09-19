'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'

export interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'warning' | 'error'
}

export type Notify = (
  message: string, severity?: SnackbarState['severity'],
) => void

const NO_TENANT = 'Site is still loading; try again in a moment.'

/** Snackbar state plus a tenant-guarded, error-reporting runner. */
export function useBackupNotify(tenantId: number | null) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false, message: '', severity: 'success',
  })

  const notify: Notify = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity })

  const run = async (
    label: string, task: (id: number) => Promise<void>,
  ) => {
    if (tenantId == null) return notify(NO_TENANT, 'warning')
    try {
      await task(tenantId)
    } catch (err) {
      notify(apiErrorMessage(err, `Failed to ${label}.`), 'error')
    }
  }

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }))

  return { snackbar, notify, run, handleCloseSnackbar }
}
