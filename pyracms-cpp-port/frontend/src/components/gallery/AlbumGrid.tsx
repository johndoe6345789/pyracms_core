import { Grid } from '@mui/material'
import AlbumCard from './AlbumCard'
import type { GalleryAlbum } from '@/hooks/useGalleryAlbums'

interface AlbumGridProps {
  albums: GalleryAlbum[]
  slug: string
}

export default function AlbumGrid({ albums, slug }: AlbumGridProps) {
  return (
    <Grid container spacing={3}>
      {albums.map((album) => (
        <Grid item xs={12} sm={6} md={4} key={album.id}>
          <AlbumCard album={album} slug={slug} />
        </Grid>
      ))}
    </Grid>
  )
}
