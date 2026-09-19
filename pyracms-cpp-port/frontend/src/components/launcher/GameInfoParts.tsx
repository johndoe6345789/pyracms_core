import { Box, Typography, Paper } from '@mui/material'
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.id}
            src={s.src}
            alt={s.title}
            height={180}
            style={{ borderRadius: 4, scrollSnapAlign: 'start' }}
          />
        ))}
      </Box>
    </Section>
  )
}
