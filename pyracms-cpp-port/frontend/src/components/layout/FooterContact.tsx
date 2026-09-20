import { Link as MuiLink } from '@mui/material'

/** "Contact" mailto link from the site's contact_email setting. */
export default function FooterContact({
  email,
}: {
  email?: string | undefined
}) {
  if (!email) return null
  return (
    <MuiLink
      href={`mailto:${email}`}
      sx={{ color: 'text.secondary', fontSize: 14 }}
      data-testid="footer-contact"
    >
      Contact
    </MuiLink>
  )
}
