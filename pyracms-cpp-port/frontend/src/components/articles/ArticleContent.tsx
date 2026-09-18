'use client'

import { Paper, Box } from '@mui/material'
import DOMPurify from 'dompurify'
import { MarkdownPreview } from './MarkdownPreview'
import { HTML_STYLES } from './articleHtmlStyles'

interface ArticleContentProps {
  content: string
  renderer: string
}

export function ArticleContent(
  { content, renderer }: ArticleContentProps
) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 4, mb: 4, borderColor: 'divider' }}
      data-testid="article-content"
    >
      {renderer === 'markdown' ? (
        <MarkdownPreview value={content} />
      ) : (
        <Box
          sx={HTML_STYLES}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content),
          }}
        />
      )}
    </Paper>
  )
}
