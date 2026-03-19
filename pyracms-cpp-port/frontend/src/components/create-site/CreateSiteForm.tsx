'use client'

import {
  Box, Button, Typography, Alert,
} from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import { useCreateSite } from '@/hooks/useCreateSite'
import CreateSiteFields from './CreateSiteFields'

export default function CreateSiteForm() {
  const {
    form, updateField, loading, error, handleSubmit,
  } = useCreateSite()

  return (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Create Your Site
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Choose a name and URL slug for your new site.
      </Typography>

      {error && (
        <Alert
          severity="error"
          role="alert"
          aria-live="assertive"
          data-testid="create-site-error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        data-testid="create-site-form"
        aria-label="Create site form"
      >
        <CreateSiteFields
          form={form}
          updateField={updateField}
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          size="large"
          disabled={loading}
          startIcon={<AddCircleOutline />}
          data-testid="create-site-submit"
          aria-label={
            loading ? 'Creating site' : 'Create site'
          }
          sx={{
            py: 1.5,
            background:
              'linear-gradient(135deg, #667eea 0%,'
              + ' #764ba2 100%)',
          }}
        >
          {loading ? 'Creating...' : 'Create Site'}
        </Button>
      </form>
    </Box>
  )
}
