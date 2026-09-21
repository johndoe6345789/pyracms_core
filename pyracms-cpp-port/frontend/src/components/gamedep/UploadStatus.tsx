import { Alert, Box, LinearProgress, Typography } from '@mui/material'
import type { UploadProgressState } from '@/hooks/useArchiveUpload'

interface Props {
  label: string
  progress: UploadProgressState | null
  error: string
  doneName?: string | undefined
}

/** Accessible progress bar plus error / success message for an upload. */
export default function UploadStatus({
  label,
  progress,
  error,
  doneName,
}: Props) {
  const pct = progress
    ? Math.round((progress.done / Math.max(progress.total, 1)) * 100)
    : 0
  return (
    <Box sx={{ mt: 1 }}>
      {progress && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            aria-label={label}
            aria-valuenow={pct}
          />
          <Typography variant="caption">{pct}%</Typography>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {doneName && !progress && !error && (
        <Typography variant="caption">Uploaded {doneName}</Typography>
      )}
    </Box>
  )
}
