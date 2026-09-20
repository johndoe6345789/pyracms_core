'use client'

import AppDrawer from './AppDrawer'
import { tenantSections, TENANT_FOOTER } from './navConfig'
import { useSiteFeatures } from '@/hooks/useSiteFeatures'

interface TenantDrawerProps {
  slug: string
  siteName: string
  description?: string | undefined
  canAdmin: boolean
  open: boolean
  onClose: () => void
}

/** Burger drawer for a site: every module plus Admin for site admins. */
export default function TenantDrawer({
  slug,
  siteName,
  description,
  canAdmin,
  open,
  onClose,
}: TenantDrawerProps) {
  const { flags } = useSiteFeatures(slug)
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={siteName}
      subtitle={description || 'Site navigation'}
      sections={tenantSections(slug, canAdmin, flags)}
      footer={TENANT_FOOTER}
    />
  )
}
