'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import AccountSettings from '@/components/users/AccountSettings'

export default function TenantAccountPage() {
  const slug = useParams().slug as string
  return (
    <Container maxWidth="sm" sx={{ py: 6 }} data-testid="account-page">
      <AccountSettings
        loginHref={`/auth/login?tenant=${encodeURIComponent(slug)}`}
      />
    </Container>
  )
}
