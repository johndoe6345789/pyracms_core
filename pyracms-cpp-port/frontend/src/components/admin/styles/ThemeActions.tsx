import { Box, Button } from '@mui/material'
import {
  SaveOutlined,
  RestoreOutlined,
  FileUploadOutlined,
  FileDownloadOutlined,
} from '@mui/icons-material'

interface Props {
  onReset: () => void
  onSave: () => void
  onExport: () => void
  onImport: () => void
}

export default function ThemeActions(p: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        startIcon={<RestoreOutlined />}
        onClick={p.onReset}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        startIcon={<SaveOutlined />}
        onClick={p.onSave}
      >
        Save
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileDownloadOutlined />}
        onClick={p.onExport}
      >
        Export JSON
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileUploadOutlined />}
        onClick={p.onImport}
      >
        Import JSON
      </Button>
    </Box>
  )
}
