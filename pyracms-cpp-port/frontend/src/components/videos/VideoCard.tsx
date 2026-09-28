import NextLink from 'next/link'
import { Box, CardActionArea, Chip, Link, Typography } from '@mui/material'
import VideoThumb from './VideoThumb'
import { timeAgo } from '@/components/common/comment/types'
import { formatViews } from '@/lib/videoFormat'
import {
  channelHref,
  VISIBILITY_LABELS,
  watchHref,
  type VideoSummary,
} from '@/lib/videos'

export const clamp = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
})

/** Grid tile: still, title, channel and "N views · time ago". */
export default function VideoCard({
  video: v,
  slug,
}: {
  video: VideoSummary
  slug: string
}) {
  const href = watchHref(slug, v.id)
  return (
    <Box data-testid={`video-card-${v.id}`}>
      <CardActionArea component={NextLink} href={href} sx={{ borderRadius: 2 }}>
        <VideoThumb {...v} />
      </CardActionArea>
      <Box sx={{ mt: 1 }}>
        <Link
          component={NextLink}
          href={href}
          underline="none"
          color="text.primary"
          variant="subtitle1"
          fontWeight={600}
          title={v.title}
          sx={clamp(2)}
        >
          {v.title}
        </Link>
        <Link
          component={NextLink}
          href={channelHref(slug, v.userId)}
          underline="hover"
          color="text.secondary"
          variant="body2"
          sx={{ display: 'block' }}
          data-testid={`video-channel-${v.id}`}
        >
          {v.username}
        </Link>
        <Typography variant="body2" color="text.secondary" component="div">
          {formatViews(v.viewCount)} · {timeAgo(v.createdAt)}
          {v.visibility !== 'public' && (
            <Chip
              size="small"
              label={VISIBILITY_LABELS[v.visibility]}
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
      </Box>
    </Box>
  )
}
