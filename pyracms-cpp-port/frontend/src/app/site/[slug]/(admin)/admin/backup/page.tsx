'use client'

import { Box, Stack, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useTenantId } from '@/hooks/useTenantId'
import { useSiteBackup } from '@/hooks/admin/useSiteBackup'
import BackupStatus from '@/components/admin/backup/BackupStatus'
import ExportPanel from '@/components/admin/backup/ExportPanel'
import RestorePanel from '@/components/admin/backup/RestorePanel'
import RestoreReport from '@/components/admin/backup/RestoreReport'

export default function AdminBackupPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const b = useSiteBackup(tenantId, slug)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Backup &amp; Restore
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Save your whole site to one file, or bring parts of it back.
      </Typography>
      <Stack spacing={3}>
        <ExportPanel
          selected={b.exportSet.keys}
          busy={b.task.busy}
          onToggle={b.exportSet.toggle}
          onExport={() => b.exportNow()}
        />
        <RestorePanel
          file={b.file}
          selected={b.restoreSet.keys}
          busy={b.task.busy}
          onToggle={b.restoreSet.toggle}
          onPick={b.load}
          onRestore={() => b.restoreNow()}
        />
      </Stack>
      <BackupStatus {...b.task} done={b.done} />
      <RestoreReport report={b.report} />
    </Box>
  )
}
