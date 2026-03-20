import { Paper, Box } from '@mui/material'
import VideoPlayer from './VideoPlayer'

interface PictureViewerProps {
  src: string
  title: string
  isVideo: boolean
}

export default function PictureViewer({
  src,
  title,
  isVideo,
}: PictureViewerProps) {
  return (
    <Paper
      variant="outlined"
      data-testid="picture-viewer"
      sx={{
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 4,
      }}
    >
      {isVideo ? (
        <VideoPlayer src={src} />
      ) : (
        <Box
          component="img"
          src={src}
          alt={title}
          sx={{
            width: '100%',
            display: 'block',
          }}
        />
      )}
    </Paper>
  )
}
