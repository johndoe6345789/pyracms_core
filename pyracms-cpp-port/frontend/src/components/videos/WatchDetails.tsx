import { Box, Typography } from '@mui/material'
import { galleryFileUrl } from '@/lib/galleryImage'
import type { VideoDetail } from '@/lib/videos'
import VideoChannelRow from './VideoChannelRow'
import VideoDescription from './VideoDescription'
import VideoOwnerActions from './VideoOwnerActions'
import VideoVotes from './VideoVotes'

interface Props {
  slug: string
  video: VideoDetail
  canVote: boolean
  canManage: boolean
  onVote: (isLike: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

/** Player, title, channel row with votes and actions, description. */
export default function WatchDetails({ video: v, ...p }: Props) {
  const poster = galleryFileUrl(v.thumbnailUuid)
  return (
    <Box data-testid="video-watch">
      <Box
        component="video"
        controls
        preload="metadata"
        src={galleryFileUrl(v.fileUuid)}
        {...(poster ? { poster } : {})}
        data-testid="video-player"
        sx={{
          width: '100%',
          aspectRatio: '16 / 9',
          bgcolor: '#000',
          borderRadius: 2,
          display: 'block',
        }}
      />
      <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 1.5 }}>
        {v.title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <VideoChannelRow
          slug={p.slug}
          userId={v.userId}
          username={v.username}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <VideoVotes
            likes={v.likes}
            dislikes={v.dislikes}
            myVote={v.myVote}
            disabled={!p.canVote}
            onVote={p.onVote}
          />
          {p.canManage && (
            <VideoOwnerActions onEdit={p.onEdit} onDelete={p.onDelete} />
          )}
        </Box>
      </Box>
      <VideoDescription {...v} />
    </Box>
  )
}
