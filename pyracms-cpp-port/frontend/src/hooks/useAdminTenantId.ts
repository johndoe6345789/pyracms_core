'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

let cachedId: number | null = null

export function useAdminTenantId() {
  const [tenantId, setTenantId] = useState<number | null>(cachedId)

  useEffect(() => {
    if (cachedId) {
      setTenantId(cachedId)
      return
    }
    api.get('/api/tenants')
      .then(res => {
        const tenants = res.data || []
        if (tenants.length > 0) {
          cachedId = tenants[0].id
          setTenantId(cachedId)
        }
      })
      .catch(() => {})
  }, [])

  return { tenantId }
}
