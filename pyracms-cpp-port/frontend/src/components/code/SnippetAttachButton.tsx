import { Button } from '@mui/material'
import { AttachFileOutlined } from '@mui/icons-material'

interface Props {
  busy: boolean
  onFiles: (files: FileList) => void
}

/** Label-button wrapping the hidden multi-file picker, same shape as
 * AlbumUploadButton but for arbitrary snippet input files, not just
 * images. */
export function SnippetAttachButton({ busy, onFiles }: Props) {
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<AttachFileOutlined />}
      component="label"
      data-testid="attach-file-btn"
      aria-label="Attach a file"
      disabled={busy}
    >
      {busy ? 'Uploading...' : 'Attach file'}
      <input
        type="file"
        hidden
        multiple
        data-testid="attach-file-input"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </Button>
  )
}
