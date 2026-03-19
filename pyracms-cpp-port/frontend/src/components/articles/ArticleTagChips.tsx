'use client'

import { Box, Chip } from '@mui/material'

interface ArticleTagChipsProps {
  tags: string[]
  color?: 'default' | 'primary'
}

export function ArticleTagChips({ tags, color = 'default' }: ArticleTagChipsProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" color={color} />
      ))}
    </Box>
  )
}
