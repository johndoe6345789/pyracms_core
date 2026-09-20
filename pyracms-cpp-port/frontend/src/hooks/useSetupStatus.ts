'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

/**
 * Does the platform still need its first account? `null` while unknown;
 * a failed lookup counts as "no" so an outage never traps visitors on the
 * setup screen.
 */
export function useSetupStatus(): boolean | null {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  useEffect(() => {
    let live = true
    Promise.resolve(api.get('/api/auth/setup'))
      .then((res) => live && setNeedsSetup(!!res?.data?.needsSetup))
      .catch(() => live && setNeedsSetup(false))
    return () => {
      live = false
    }
  }, [])
  return needsSetup
}
