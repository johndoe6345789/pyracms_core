import { TextField } from '@mui/material'

interface Props {
  title: string
  description: string
  onTitle: (v: string) => void
  onDescription: (v: string) => void
}

/** Title and description inputs, capped at the server's limits. */
export default function VideoTextFields(p: Props) {
  return (
    <>
      <TextField
        fullWidth
        required
        margin="dense"
        label="Title"
        value={p.title}
        onChange={(e) => p.onTitle(e.target.value)}
        inputProps={{ maxLength: 200, 'data-testid': 'video-title-input' }}
      />
      <TextField
        fullWidth
        multiline
        minRows={3}
        margin="dense"
        label="Description"
        value={p.description}
        onChange={(e) => p.onDescription(e.target.value)}
        inputProps={{ maxLength: 5000, 'data-testid': 'video-desc-input' }}
      />
    </>
  )
}
