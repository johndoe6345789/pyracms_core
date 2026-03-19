import { ImageList, ImageListItem } from '@mui/material'
import type { Screenshot } from '@/hooks/useGameDepDetail'

interface ScreenshotGridProps {
  screenshots: Screenshot[]
}

export default function ScreenshotGrid({ screenshots }: ScreenshotGridProps) {
  return (
    <ImageList cols={3} gap={16}>
      {screenshots.map((ss) => (
        <ImageListItem
          key={ss.id}
          sx={{ borderRadius: 2, overflow: 'hidden' }}
        >
          <img
            src={ss.src}
            alt={ss.title}
            loading="lazy"
            style={{ display: 'block', width: '100%', borderRadius: 12 }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  )
}
