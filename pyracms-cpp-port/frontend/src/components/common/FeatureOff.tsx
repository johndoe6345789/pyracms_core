import { Box, Button, Typography } from '@mui/material'
import { BlockOutlined } from '@mui/icons-material'
import Link from 'next/link'

/** Friendly stand-in for a page whose feature the site turned off. */
export default function FeatureOff({
  slug,
  name,
}: {
  slug: string
  name?: string
}) {
  return (
    <Box
      role="status"
      data-testid="feature-off"
      sx={{ textAlign: 'center', py: 10, px: 2 }}
    >
      <BlockOutlined sx={{ fontSize: 56, color: 'text.secondary' }} />
      <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
        This feature is turned off for this site
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {name ? `${name} is` : 'It is'} not available here right now.
      </Typography>
      <Button component={Link} href={`/site/${slug}`} variant="outlined">
        Back to site home
      </Button>
    </Box>
  )
}
