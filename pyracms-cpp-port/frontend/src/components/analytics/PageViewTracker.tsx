'use client'

import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'

/** True when the visitor asked not to be tracked. */
export function doNotTrack(): boolean {
  return typeof navigator !== 'undefined'
    && navigator.doNotTrack === '1'
}

/** Sends one anonymous page view per route change; renders nothing. */
export default function PageViewTracker() {
  const slug = useParams().slug as string
  const pathname = usePathname()
  const { tenantId } = useTenantId(slug)

  useEffect(() => {
    if (!tenantId || !pathname) return
    if (doNotTrack() || pathname.includes('/admin')) return
    api.post('/api/analytics/track', {
      path: pathname,
      tenant_id: tenantId,
      referrer: document.referrer,
    }).catch(() => {})
  }, [tenantId, pathname])

  return null
}
