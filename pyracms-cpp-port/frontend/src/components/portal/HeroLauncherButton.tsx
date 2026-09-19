import { Button } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import Link from 'next/link'

/** Secondary hero action: get the Hypernucleus launcher. */
export default function HeroLauncherButton() {
  return (
    <Button
      component={Link}
      href="/download"
      size="large"
      variant="outlined"
      startIcon={<DownloadOutlined />}
      data-testid="hero-download-button"
      sx={{
        mt: 2,
        color: 'white',
        borderColor: 'rgba(255,255,255,0.7)',
        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
      }}
    >
      Get the launcher
    </Button>
  )
}
