import { Button, Card, CardContent, Typography } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import { SECTIONS } from '@/lib/backup/sections'
import type { SectionKey } from '@/lib/backup/types'
import SectionPicker from './SectionPicker'

interface Props {
  selected: SectionKey[]
  busy: boolean
  onToggle: (key: SectionKey) => void
  onExport: () => void
}

/** Choose what to save, then download one backup file. */
export default function ExportPanel({
  selected,
  busy,
  onToggle,
  onExport,
}: Props) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Back up this site
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Saves the parts you tick into one JSON file. Uploaded files stay in
          storage; photos in albums are listed by name.
        </Typography>
        <SectionPicker
          sections={SECTIONS}
          selected={selected}
          onToggle={onToggle}
        />
        <Button
          variant="contained"
          startIcon={<DownloadOutlined />}
          disabled={busy || selected.length === 0}
          onClick={onExport}
        >
          Download backup
        </Button>
      </CardContent>
    </Card>
  )
}
