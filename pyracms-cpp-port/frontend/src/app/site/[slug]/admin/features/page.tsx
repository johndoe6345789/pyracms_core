'use client'

import { Typography, Box, Button, Snackbar, Alert } from '@mui/material'
import { SaveOutlined } from '@mui/icons-material'
import { useFeatureToggles } from '@/hooks/useFeatureToggles'
import { useTenantId } from '@/hooks/useTenantId'
import { useParams } from 'next/navigation'
import FeatureToggleCard from '@/components/admin/FeatureToggleCard'

export default function AdminFeaturesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { features, snackbarOpen, handleToggle, handleSave, handleCloseSnackbar } =
    useFeatureToggles(tenantId)

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>Feature Toggles</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enable or disable features across the platform.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {features.map((feature) => (
          <FeatureToggleCard key={feature.id} feature={feature} onToggle={handleToggle} />
        ))}
      </Box>
      <Button variant="contained" startIcon={<SaveOutlined />} size="large" onClick={handleSave}>
        Save Changes
      </Button>
      <Snackbar
        open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Feature toggles saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  )
}
