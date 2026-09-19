'use client'

import { Box, Divider, Snackbar, Alert, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useBackupRestore } from '@/hooks/useBackupRestore'
import { useTenantId } from '@/hooks/useTenantId'
import ExportButtons from '@/components/admin/ExportButtons'
import ImportSection from '@/components/admin/ImportSection'

export default function AdminBackupPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const {
    snackbar,
    fileInputRef,
    handleExportSettings,
    handleExportMenus,
    handleImportClick,
    handleFileChange,
    handleCloseSnackbar,
  } = useBackupRestore(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Backup &amp; Restore
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Export and import your PyraCMS configuration data.
      </Typography>
      <ExportButtons
        onExportSettings={handleExportSettings}
        onExportMenus={handleExportMenus}
      />
      <Divider sx={{ mb: 5 }} />
      <ImportSection
        fileInputRef={fileInputRef}
        onImportClick={handleImportClick}
        onFileChange={handleFileChange}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
