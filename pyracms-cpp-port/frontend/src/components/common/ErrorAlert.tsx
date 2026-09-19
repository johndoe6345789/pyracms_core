import { Alert } from '@mui/material'

interface Props {
  error: string
  testId: string
  mb?: number
}

/** Renders a mutation failure; nothing when there is no error. */
export function ErrorAlert({ error, testId, mb = 2 }: Props) {
  if (!error) return null
  return (
    <Alert severity="error" role="alert" data-testid={testId} sx={{ mb }}>
      {error}
    </Alert>
  )
}
