import { Box, Button, Typography } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface Props { href: string; compact?: boolean }

/** "Need Hypernucleus? Download": points at the site's /download page. */
export default function GetLauncherLink({ href, compact }: Props) {
  const btn = (
    <Button component={Link} href={href} size="small" variant="outlined"
      startIcon={<DownloadOutlined />} data-testid="get-launcher-link">
      Download
    </Button>
  )
  return (
    <Box data-testid="get-launcher-banner" sx={{ display: 'flex', gap: 1,
      alignItems: 'center', flexWrap: 'wrap', mb: compact ? 0 : 2 }}>
      <Typography variant="body2" color="text.secondary">
        Need Hypernucleus?
      </Typography>
      {btn}
    </Box>
  )
}
