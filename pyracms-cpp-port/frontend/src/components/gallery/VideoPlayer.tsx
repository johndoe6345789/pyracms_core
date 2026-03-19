import { Box } from '@mui/material'

interface VideoPlayerProps {
  src: string
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <Box
      component="video"
      controls
      sx={{ width: '100%', display: 'block' }}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </Box>
  )
}
