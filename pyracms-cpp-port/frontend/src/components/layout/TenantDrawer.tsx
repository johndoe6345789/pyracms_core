'use client'

import AppDrawer from './AppDrawer'
import { tenantSections, TENANT_FOOTER } from './navConfig'
import { useSiteNav } from '@/hooks/useSiteNav'

interface TenantDrawerProps {
  slug: string
  siteName: string
  description?: string | undefined
  canAdmin: boolean
  open: boolean
  onClose: () => void
}

/** Burger drawer: the owner's links, then Explore, then Admin. */
export default function TenantDrawer({
  slug,
  siteName,
  description,
  canAdmin,
  open,
  onClose,
}: TenantDrawerProps) {
  const { flags, ownerLinks } = useSiteNav(slug)
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={siteName}
      subtitle={description || 'Site navigation'}
      sections={tenantSections(slug, canAdmin, flags, ownerLinks)}
      footer={TENANT_FOOTER}
    />
  )
}
