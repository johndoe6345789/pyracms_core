'use client'

import { Box, Divider, Snackbar, Alert, Typography } from '@mui/material'
import { useBackupRestore } from '@/hooks/useBackupRestore'
import ExportButtons from '@/components/admin/ExportButtons'
import ImportSection from '@/components/admin/ImportSection'

export default function AdminBackupPage() {
  const {
    snackbar, fileInputRef,
    handleExportSettings, handleExportMenus,
    handleImportClick, handleFileChange, handleCloseSnackbar,
  } = useBackupRestore()

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Backup &amp; Restore</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Export and import your PyraCMS configuration data.
      </Typography>
      <ExportButtons onExportSettings={handleExportSettings} onExportMenus={handleExportMenus} />
      <Divider sx={{ mb: 5 }} />
      <ImportSection
        fileInputRef={fileInputRef}
        onImportClick={handleImportClick}
        onFileChange={handleFileChange}
      />
      <Snackbar
        open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
