'use client'

import { Paper, Box } from '@mui/material'
import DOMPurify from 'dompurify'
import { MarkdownPreview } from './MarkdownPreview'

interface ArticleContentProps {
  content: string
  renderer: string
}

const HTML_STYLES = {
  '& h1': { fontSize: '2rem', fontWeight: 700, mt: 3, mb: 1 },
  '& h2': { mt: 3, mb: 1.5, fontWeight: 600, fontSize: '1.5rem' },
  '& h3': { mt: 2, mb: 1, fontWeight: 600, fontSize: '1.25rem' },
  '& p': { mb: 2, lineHeight: 1.8, color: 'text.primary' },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& a': { color: 'primary.main' },
  '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
  '& th, & td': { border: '1px solid', borderColor: 'divider', px: 2, py: 1 },
  '& th': { bgcolor: 'background.default', fontWeight: 600 },
  '& pre': { bgcolor: '#1e293b', color: '#e2e8f0', p: 2, borderRadius: 1, overflow: 'auto' },
  '& code': { bgcolor: '#f1f5f9', px: 0.5, borderRadius: 0.5, fontSize: '0.875rem' },
  '& pre code': { bgcolor: 'transparent', p: 0 },
  '& blockquote': { borderLeft: '3px solid', borderColor: 'divider', pl: 2, ml: 0, color: 'text.secondary' },
  '& img': { maxWidth: '100%', height: 'auto' },
}

export function ArticleContent({ content, renderer }: ArticleContentProps) {
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
