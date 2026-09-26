import { Alert, LinearProgress, Stack, Typography } from '@mui/material'

interface Props {
  busy: boolean
  progress: string
  error: string
  done: string
}

/** What the backup job is doing now, or how it ended. */
export default function BackupStatus({ busy, progress, error, done }: Props) {
  return (
    <Stack spacing={1} sx={{ my: 2 }} aria-live="polite">
      {busy && (
        <>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary">
            {progress || 'Working...'}
          </Typography>
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {done && !busy && !error && <Alert severity="success">{done}</Alert>}
    </Stack>
  )
}
