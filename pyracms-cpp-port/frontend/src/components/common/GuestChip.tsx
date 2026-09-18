import { Chip } from '@mui/material'
import { PersonOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface Props {
  slug: string | undefined
  pathname: string | null
  /** Signed in, but to a different site */
  otherSite: boolean
}

/** "Sign in" chip shown when there is no session for this scope. */
export default function GuestChip({ slug, pathname, otherSite }: Props) {
  const href = slug
    ? `/auth/login?tenant=${encodeURIComponent(slug)}`
      + `&redirect=${encodeURIComponent(pathname || `/site/${slug}`)}`
    : '/auth/login'
  return (
    <Chip
      icon={<PersonOutlined />}
      label={otherSite ? 'Sign in here' : 'Sign in'}
      variant="outlined"
      size="small"
      component={Link}
      href={href}
      clickable
      data-testid="guest-login-link"
      sx={{ borderColor: 'divider', color: 'text.secondary' }}
    />
  )
}
