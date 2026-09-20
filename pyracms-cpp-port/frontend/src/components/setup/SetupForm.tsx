'use client'

import { Alert, Button, Typography } from '@mui/material'
import { useSetup } from '@/hooks/useSetup'
import RegisterFields from '@/components/auth/RegisterFields'

/** Splash form that creates the platform's first (Platform Owner) account. */
export default function SetupForm() {
  const { formData, updateField, error, loading, handleSubmit } = useSetup()
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Welcome to PyraCMS
      </Typography>
      <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
        Create the Platform Owner account. It manages the whole platform and can
        never be created again from this screen.
      </Typography>
      {error && (
        <Alert severity="error" role="alert" data-testid="setup-error">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} data-testid="setup-form">
        <RegisterFields formData={formData} updateField={updateField} />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          data-testid="setup-submit"
          sx={{ mt: 3 }}
        >
          {loading ? 'Creating...' : 'Create Platform Owner'}
        </Button>
      </form>
    </>
  )
}
