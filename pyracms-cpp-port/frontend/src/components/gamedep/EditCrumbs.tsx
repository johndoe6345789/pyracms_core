import { Typography, Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import { NavigateNextOutlined } from '@mui/icons-material'

const linkSx = { color: 'inherit', textDecoration: 'none' }

interface EditCrumbsProps {
  slug: string
  detailHref: string
  displayName: string
}

export default function EditCrumbs({
  slug, detailHref, displayName,
}: EditCrumbsProps) {
  return (
    <Breadcrumbs sx={{ mb: 3 }}
      separator={<NavigateNextOutlined fontSize="small" />}>
      <Link href={`/site/${slug}/dependencies`} style={linkSx}>
        Dependencies
      </Link>
      <Link href={detailHref} style={linkSx}>{displayName}</Link>
      <Typography color="text.primary">Edit</Typography>
    </Breadcrumbs>
  )
}
