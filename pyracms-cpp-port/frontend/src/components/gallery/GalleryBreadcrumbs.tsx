import { Breadcrumbs, Typography } from '@mui/material'
import Link from 'next/link'
import { NavigateNextOutlined } from '@mui/icons-material'

interface GalleryBreadcrumbsProps {
  slug: string
  label: string
  testId: string
  current: string
  albumName?: string
  albumUrl?: string
}

const linkSx = { color: 'inherit', textDecoration: 'none' }

export default function GalleryBreadcrumbs({
  slug,
  label,
  testId,
  current,
  albumName,
  albumUrl,
}: GalleryBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextOutlined fontSize="small" />}
      sx={{ mb: 3 }}
      aria-label={label}
      data-testid={testId}
    >
      <Link href={`/site/${slug}/gallery`} style={linkSx}>
        Gallery
      </Link>
      {albumUrl && (
        <Link href={albumUrl} style={linkSx}>
          {albumName}
        </Link>
      )}
      <Typography color="text.primary">{current}</Typography>
    </Breadcrumbs>
  )
}
