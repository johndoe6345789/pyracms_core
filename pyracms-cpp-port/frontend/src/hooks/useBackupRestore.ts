'use client'

import { fetchSettings } from './admin/settingsApi'
import { fetchMenuGroups } from './admin/menuData'
import {
  downloadJson, buildSettingsPayload, buildMenusPayload,
} from './admin/backupPayloads'
import { useBackupNotify } from './admin/useBackupNotify'
import { useBackupImport } from './admin/useBackupImport'

/**
 * Backup export/import for one tenant's real settings and menus.
 * @param tenantId Tenant whose data is exported or restored.
 */
export function useBackupRestore(tenantId: number | null) {
  const { snackbar, notify, run, handleCloseSnackbar } =
    useBackupNotify(tenantId)
  const imp = useBackupImport(notify, run)

  const handleExportSettings = () => run('export settings', async (id) => {
    const payload = buildSettingsPayload(await fetchSettings(id))
    downloadJson(payload, 'pyracms-settings-export.json')
    notify('Settings exported successfully.')
  })

  const handleExportMenus = () => run('export menus', async (id) => {
    const payload = buildMenusPayload(await fetchMenuGroups(id))
    downloadJson(payload, 'pyracms-menus-export.json')
    notify('Menus exported successfully.')
  })

  return {
    snackbar, handleCloseSnackbar,
    handleExportSettings, handleExportMenus, ...imp,
  }
}
