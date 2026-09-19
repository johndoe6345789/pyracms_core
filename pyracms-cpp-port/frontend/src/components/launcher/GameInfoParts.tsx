import { Box, Typography, Paper } from '@mui/material'
import Image from 'next/image'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}

/** Horizontally scrolling screenshot strip. */
export function Screenshots({
  shots,
}: {
  shots: GameDepDetailData['screenshots']
}) {
  return (
    <Section title="Screenshots">
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
        }}
      >
        {shots.map((s) => (
          <Box
            key={s.id}
            sx={{
              position: 'relative',
              flexShrink: 0,
              height: 180,
              aspectRatio: '16/9',
              scrollSnapAlign: 'start',
            }}
          >
            <Image
              src={s.src}
              alt={s.title}
              fill
              unoptimized
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          </Box>
        ))}
      </Box>
    </Section>
  )
}
