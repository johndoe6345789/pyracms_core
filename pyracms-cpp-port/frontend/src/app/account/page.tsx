'use client'

import { Container } from '@mui/material'
import AccountSettings from '@/components/users/AccountSettings'

export default function PortalAccountPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }} data-testid="account-page">
      <AccountSettings loginHref="/auth/login" />
    </Container>
  )
}
