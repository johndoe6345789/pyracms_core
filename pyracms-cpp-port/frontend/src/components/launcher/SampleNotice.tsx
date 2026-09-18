import { Alert } from '@mui/material'

/** Warns that the listed games are placeholders, not real downloads. */
export default function SampleNotice() {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      No games are published yet. These are sample entries for layout
      only, not real downloads.
    </Alert>
  )
}
