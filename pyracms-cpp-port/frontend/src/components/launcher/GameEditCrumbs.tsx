import { Breadcrumbs, Typography } from '@mui/material'
import { NavigateNextOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface Props {
  slug: string
  name: string
  displayName: string
}

const linkStyle = { color: 'inherit', textDecoration: 'none' } as const

/** Games / <game> / Edit breadcrumb trail. */
export default function GameEditCrumbs({ slug, name, displayName }: Props) {
  return (
    <Breadcrumbs
      separator={<NavigateNextOutlined fontSize="small" />}
      sx={{ mb: 3 }}
    >
      <Link href={`/site/${slug}/games`} style={linkStyle}>Games</Link>
      <Link href={`/site/${slug}/games/${name}`} style={linkStyle}>
        {displayName}
      </Link>
      <Typography color="text.primary">Edit</Typography>
    </Breadcrumbs>
  )
}
