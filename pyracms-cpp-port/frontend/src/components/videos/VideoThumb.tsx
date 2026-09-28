import { Box } from '@mui/material'
import { PlayCircleOutline } from '@mui/icons-material'
import { galleryFileUrl } from '@/lib/galleryImage'
import { formatDuration } from '@/lib/videoFormat'

interface Props {
  thumbnailUuid: string
  title: string
  durationSeconds: number
}

/** 16:9 still with the running time; a play tile when there is none. */
export default function VideoThumb(p: Props) {
  const src = galleryFileUrl(p.thumbnailUuid)
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '16 / 9',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'action.hover',
        display: 'grid',
        placeItems: 'center',
        color: 'text.disabled',
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={p.title}
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <PlayCircleOutline
          sx={{ fontSize: 48 }}
          data-testid="video-thumb-placeholder"
        />
      )}
      {p.durationSeconds > 0 && (
        <Box
          component="span"
          data-testid="video-duration"
          sx={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            px: 0.5,
            borderRadius: 0.5,
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            bgcolor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          {formatDuration(p.durationSeconds)}
        </Box>
      )}
    </Box>
  )
}
