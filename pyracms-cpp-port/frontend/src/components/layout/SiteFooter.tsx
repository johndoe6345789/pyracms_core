import { Box, Container, Link as MuiLink, Typography } from '@mui/material'
import Link from 'next/link'
import FooterContact from './FooterContact'
import ForkRibbon from '@/components/common/ForkRibbon'
import { docsUrl, licenseUrl, releasesUrl, repoUrl } from '@/lib/repo'

const linkSx = { color: 'text.secondary', fontSize: 14 }

/** Footer shared by the portal and every site. */
export default function SiteFooter({
  downloadHref = '/download',
  contactEmail,
}: {
  downloadHref?: string
  contactEmail?: string | undefined
}) {
  const ext = { target: '_blank', rel: 'noopener noreferrer' }
  return (
    <Box
      component="footer"
      data-testid="site-footer"
      sx={{
        mt: 6,
        py: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        '@media print': { display: 'none' },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          PyraCMS - multi-tenant CMS in C++ and React
        </Typography>
        <Box
          component="nav"
          aria-label="Footer"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <FooterContact email={contactEmail} />
          <MuiLink
            component={Link}
            href={downloadHref}
            sx={linkSx}
            data-testid="footer-download"
          >
            Download launcher
          </MuiLink>
          <MuiLink href={releasesUrl()} {...ext} sx={linkSx}>
            Releases
          </MuiLink>
          <MuiLink href={repoUrl()} {...ext} sx={linkSx}>
            GitHub
          </MuiLink>
          <MuiLink href={docsUrl()} {...ext} sx={linkSx}>
            Docs
          </MuiLink>
          <MuiLink href={licenseUrl()} {...ext} sx={linkSx}>
            License
          </MuiLink>
          <ForkRibbon variant="inline" />
        </Box>
      </Container>
    </Box>
  )
}
