import { Container, Alert, Button } from '@mui/material'
import Link from 'next/link'

/** Shown on a site home page when the API says the site is unknown. */
export default function SiteNotFound({ slug }: { slug: string }) {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Alert
        severity="warning"
        action={
          <Button component={Link} href="/" color="inherit" size="small">
            Portal
          </Button>
        }
      >
        There is no site called <strong>{slug}</strong>.
      </Alert>
    </Container>
  )
}
