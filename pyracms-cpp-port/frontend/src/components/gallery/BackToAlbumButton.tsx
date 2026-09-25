import Link from 'next/link'
import { Button } from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'

export default function BackToAlbumButton({ href }: { href: string }) {
  return (
    <Button
      component={Link}
      href={href}
      startIcon={<ArrowBackOutlined />}
      sx={{ mb: 3, color: 'text.secondary' }}
      data-testid="back-to-album-btn"
      aria-label="Back to album"
    >
      Back to album
    </Button>
  )
}
