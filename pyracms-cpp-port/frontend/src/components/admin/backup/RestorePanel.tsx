import { Alert, Button, Card, CardContent, Typography } from '@mui/material'
import { RestoreOutlined } from '@mui/icons-material'
import { SECTIONS } from '@/lib/backup/sections'
import type { BackupFile, SectionKey } from '@/lib/backup/types'
import BackupFilePicker from './BackupFilePicker'
import SectionPicker from './SectionPicker'

interface Props {
  file: BackupFile | null
  selected: SectionKey[]
  busy: boolean
  onToggle: (key: SectionKey) => void
  onPick: (file: File) => void
  onRestore: () => void
}

/** Pick a backup file, choose which parts to bring back, restore them. */
export default function RestorePanel(p: Props) {
  const counts = Object.fromEntries(
    SECTIONS.map((s) => [s.key, p.file?.sections[s.key]?.length]).filter(
      ([, n]) => n !== undefined,
    ),
  )
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Restore from a backup
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Restoring writes over what the site has now: matching settings,
          articles, snippets, albums and menu entries are replaced by the
          backup; nothing is deleted. Article edits are kept as revisions.
        </Alert>
        <BackupFilePicker disabled={p.busy} onPick={p.onPick} />
        {p.file && (
          <>
            <Typography color="text.secondary" sx={{ my: 2 }}>
              {p.file.exportedAt
                ? `Backup made ${new Date(p.file.exportedAt).toLocaleString()}.`
                : 'Backup from an older export.'}{' '}
              Choose what to restore:
            </Typography>
            <SectionPicker
              sections={SECTIONS}
              selected={p.selected}
              counts={counts}
              onToggle={p.onToggle}
            />
            <Button
              variant="contained"
              color="warning"
              startIcon={<RestoreOutlined />}
              disabled={p.busy || p.selected.length === 0}
              onClick={p.onRestore}
            >
              Restore selected
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
