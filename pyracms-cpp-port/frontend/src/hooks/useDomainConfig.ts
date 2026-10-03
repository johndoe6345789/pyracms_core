import { useEffect, useState } from 'react'

export interface DomainConfig {
  domain: string
  domainFound: boolean
  displayMode: 'single' | 'multi'
  slug?: string
  displayName?: string
  description?: string
  allSites?: Array<{
    id: number
    slug: string
    displayName: string
    description: string
  }>
  siteFound?: boolean
}

export function useDomainConfig() {
  const [config, setConfig] = useState<DomainConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
        const response = await fetch(`${apiUrl}/domain/site`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()
        console.log('[useDomainConfig] API Response:', data)
        setConfig(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch domain config'
        console.error('[useDomainConfig] Error:', message)
        setError(message)
        // Fallback: treat as multi-site
        setConfig({
          domain: '',
          domainFound: false,
          displayMode: 'multi',
          allSites: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading, error }
}
