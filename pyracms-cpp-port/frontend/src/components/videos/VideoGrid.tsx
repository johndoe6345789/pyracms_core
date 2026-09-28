import { Box, Button, Grid, Typography } from '@mui/material'
import { VideoLibraryOutlined } from '@mui/icons-material'
import VideoCard from './VideoCard'
import type { VideoSummary } from '@/lib/videos'

interface Props {
  slug: string
  items: VideoSummary[]
  loading: boolean
  hasMore: boolean
  onMore: () => void
  empty?: string
}

/** Responsive grid of video tiles, an empty state and "Load more". */
export default function VideoGrid(p: Props) {
  if (!p.items.length && !p.loading) {
    return (
      <Box
        data-testid="videos-empty"
        sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}
      >
        <VideoLibraryOutlined sx={{ fontSize: 56, mb: 1 }} />
        <Typography>{p.empty ?? 'No videos yet.'}</Typography>
      </Box>
    )
  }
  return (
    <>
      <Grid container spacing={3} data-testid="video-grid">
        {p.items.map((v) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={v.id}>
            <VideoCard video={v} slug={p.slug} />
          </Grid>
        ))}
      </Grid>
      {p.hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={p.onMore}
            disabled={p.loading}
            data-testid="videos-load-more"
          >
            Load more
          </Button>
        </Box>
      )}
    </>
  )
}
