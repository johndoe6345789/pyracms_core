import NextLink from 'next/link'
import { Box, CardActionArea, Stack, Typography } from '@mui/material'
import { formatViews } from '@/lib/videoFormat'
import { watchHref, type VideoSummary } from '@/lib/videos'
import { clamp } from './VideoCard'
import VideoThumb from './VideoThumb'

/** Side column of other videos: small still with title and channel. */
export default function UpNext({
  slug,
  items,
}: {
  slug: string
  items: VideoSummary[]
}) {
  if (!items.length) return null
  return (
    <Box component="aside" aria-label="Up next" data-testid="video-up-next">
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Up next
      </Typography>
      <Stack spacing={1.5}>
        {items.map((v) => (
          <CardActionArea
            key={v.id}
            component={NextLink}
            href={watchHref(slug, v.id)}
            data-testid={`up-next-${v.id}`}
            sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
          >
            <Box sx={{ width: 168, flexShrink: 0 }}>
              <VideoThumb {...v} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} sx={clamp(2)}>
                {v.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.username}
                <br />
                {formatViews(v.viewCount)}
              </Typography>
            </Box>
          </CardActionArea>
        ))}
      </Stack>
    </Box>
  )
}
