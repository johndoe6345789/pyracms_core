import { Box, ImageList, ImageListItem } from '@mui/material'
import Image from 'next/image'
import type { Screenshot } from '@/hooks/useGameDepDetail'

interface ScreenshotGridProps {
  screenshots: Screenshot[]
}

export default function ScreenshotGrid({ screenshots }: ScreenshotGridProps) {
  return (
    <ImageList cols={3} gap={16}>
      {screenshots.map((ss) => (
        <ImageListItem key={ss.id} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}
          >
            <Image
              src={ss.src}
              alt={ss.title}
              fill
              unoptimized
              sizes="(max-width: 900px) 100vw, 33vw"
              style={{ objectFit: 'cover', borderRadius: 12 }}
            />
          </Box>
        </ImageListItem>
      ))}
    </ImageList>
  )
}
