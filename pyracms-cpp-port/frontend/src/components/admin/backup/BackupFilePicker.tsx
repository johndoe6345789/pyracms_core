import { Button } from '@mui/material'
import { UploadFileOutlined } from '@mui/icons-material'

interface Props {
  disabled: boolean
  onPick: (file: File) => void
}

/** A button that opens the file chooser for a backup file. */
export default function BackupFilePicker({ disabled, onPick }: Props) {
  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<UploadFileOutlined />}
      disabled={disabled}
    >
      Choose backup file
      <input
        type="file"
        accept=".json,application/json"
        hidden
        data-testid="import-file-input"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ''
        }}
      />
    </Button>
  )
}
