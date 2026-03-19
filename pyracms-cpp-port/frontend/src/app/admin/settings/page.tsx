'use client'

import { Typography, Box } from '@mui/material'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { useAdminTenantId } from '@/hooks/useAdminTenantId'
import AddSettingForm from '@/components/admin/AddSettingForm'
import SettingsTable from '@/components/admin/SettingsTable'

export default function AdminSettingsPage() {
  const { tenantId } = useAdminTenantId()
  const {
    settings, editingId, editValue, setEditValue,
    newKey, setNewKey, newValue, setNewValue,
    handleStartEdit, handleSaveEdit, handleCancelEdit, handleDelete, handleAdd,
  } = useAdminSettings(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Settings</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage key-value configuration settings.
      </Typography>
      <AddSettingForm
        newKey={newKey} newValue={newValue}
        onKeyChange={setNewKey} onValueChange={setNewValue} onAdd={handleAdd}
      />
      <SettingsTable
        settings={settings} editingId={editingId}
        editValue={editValue} onEditValueChange={setEditValue}
        onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit} onDelete={handleDelete}
      />
    </Box>
  )
}
