'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, Button, CircularProgress, Typography } from '@mui/material'
import Link from 'next/link'
import AuthPageShell from '@/components/auth/AuthPageShell'
import { useOAuthCallback } from '@/hooks/useOAuthCallback'

function Content() {
  const p = useSearchParams()
  const { error } = useOAuthCallback(p.get('code') || '', p.get('state') || '')
  if (!error) {
    return (
      <div data-testid="oauth-pending" style={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Signing you in...</Typography>
      </div>
    )
  }
  return (
    <>
      <Alert severity="error" data-testid="oauth-callback-error">
        {error}
      </Alert>
      <Button component={Link} href="/auth/login" sx={{ mt: 2 }}>
        Back to sign in
      </Button>
    </>
  )
}

export default function OAuthCallbackPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </AuthPageShell>
  )
}
