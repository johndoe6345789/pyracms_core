'use client'

import { Typography, Box, Chip } from '@mui/material'
import { langColor } from '@/lib/snippets'

interface Props {
  title: string
  language: string
}

// Plain text, not its own link: the card's whole body is the click target
// now (see SnippetCard's CardActionArea), and a link nested inside another
// link is both invalid HTML and a smaller target than the card it sits in.
export function SnippetCardTitle({ title, language }: Props) {
  const color = langColor(language)
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {title}
      </Typography>
      <Chip
        label={language}
        size="small"
        sx={{
          bgcolor: color + '20',
          color,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 22,
        }}
      />
    </Box>
  )
}
