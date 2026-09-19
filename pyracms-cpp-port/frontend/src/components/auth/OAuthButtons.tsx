'use client'

import { useState } from 'react'
import { Alert, Box, Button, Divider } from '@mui/material'
import api from '@/lib/api'
import { goTo } from '@/lib/navigate'
import { isProviderUrl, stashOAuth } from '@/lib/oauth'
import { useOAuthProviders } from '@/hooks/useOAuthProviders'

/** "Continue with ..." buttons; hidden unless a provider is configured. */
export default function OAuthButtons(
  { redirectTo }: { redirectTo?: string | undefined },
) {
  const { providers } = useOAuthProviders()
  const [error, setError] = useState('')

  const start = async (id: string) => {
    setError('')
    try {
      const { data } = await api.get(`/api/auth/oauth/${id}/url`)
      if (!isProviderUrl(data?.url)) throw new Error('bad url')
      stashOAuth(id, redirectTo)
      goTo(data.url)
    } catch {
      setError('Could not start sign-in with that provider')
    }
  }

  if (providers.length === 0) return null
  return (
    <Box sx={{ mt: 2 }} data-testid="oauth-buttons">
      <Divider sx={{ mb: 2 }}>or</Divider>
      {providers.map((p) => (
        <Button key={p.id} fullWidth variant="outlined" sx={{ mb: 1 }}
          onClick={() => start(p.id)} data-testid={`oauth-${p.id}`}>
          Continue with {p.label}
        </Button>
      ))}
      {error && (
        <Alert severity="error" data-testid="oauth-error">{error}</Alert>
      )}
    </Box>
  )
}
