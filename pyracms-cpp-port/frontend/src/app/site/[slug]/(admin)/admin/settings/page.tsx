'use client'

import { useEffect } from 'react'
import { Typography, Box } from '@mui/material'
import { useParams } from 'next/navigation'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { useTenantId } from '@/hooks/useTenantId'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import AdvancedSettings from '@/components/admin/settings/AdvancedSettings'
import SiteSettingsForm from '@/components/admin/settings/SiteSettingsForm'
import { useSiteSettingsEditor } from '@/hooks/admin/useSiteSettingsEditor'
import { announceSiteSettings } from '@/hooks/useSiteSettings'

export default function AdminSettingsPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const raw = useAdminSettings(tenantId)
  const guided = useSiteSettingsEditor(tenantId)
  const { saved } = guided

  useEffect(() => {
    if (saved) announceSiteSettings(slug, saved)
  }, [slug, saved])

  return (
    <Box data-testid="admin-settings-page">
      <Typography variant="h3" sx={{ mb: 1 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Name, describe and configure your site. Each setting below takes effect
        on the public site as soon as you save.
      </Typography>
      <ErrorAlert error={guided.error} testId="site-settings-error" />
      <SiteSettingsForm ed={guided} />
      <AdvancedSettings raw={raw} />
    </Box>
  )
}
