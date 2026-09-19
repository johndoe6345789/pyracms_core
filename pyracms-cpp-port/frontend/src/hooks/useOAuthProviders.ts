'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { OAUTH_PROVIDERS } from '@/lib/oauth'

type Provider = (typeof OAUTH_PROVIDERS)[number]

/** Providers the backend has configured (the url endpoint answers). */
export function useOAuthProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let live = true
    Promise.allSettled(OAUTH_PROVIDERS.map((p) =>
      api.get(`/api/auth/oauth/${p.id}/url`)))
      .then((rs) => {
        if (!live) return
        setProviders(OAUTH_PROVIDERS.filter(
          (_, i) => rs[i]?.status === 'fulfilled'))
        setLoaded(true)
      })
    return () => { live = false }
  }, [])

  return { providers, loaded }
}
