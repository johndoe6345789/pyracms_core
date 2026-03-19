'use client'

import { Paper, Box } from '@mui/material'

interface ArticleContentProps {
  html: string
}

export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: 'divider' }}>
      <Box
        sx={{
          '& h2': { mt: 3, mb: 1.5, fontWeight: 600, fontSize: '1.5rem' },
          '& p': { mb: 2, lineHeight: 1.8, color: 'text.primary' },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Paper>
  )
}
