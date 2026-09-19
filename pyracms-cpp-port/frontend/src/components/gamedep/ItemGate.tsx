'use client'

import { Alert, CircularProgress, Container } from '@mui/material'

interface Props {
  loading: boolean
  found: boolean
  children: React.ReactNode
}

/** Spinner while loading, a not-found notice, else the page. */
export default function ItemGate({ loading, found, children }: Props) {
  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress aria-label="Loading" data-testid="item-loading" />
      </Container>
    )
  }
  if (!found) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning" data-testid="item-not-found">
          This page does not exist.
        </Alert>
      </Container>
    )
  }
  return <>{children}</>
}
