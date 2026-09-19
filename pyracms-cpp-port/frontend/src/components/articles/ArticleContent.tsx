'use client'

import { useEffect, useState } from 'react'
import { Paper, Box } from '@mui/material'
import { sanitizeHtml } from '@/lib/sanitize'
import { MarkdownPreview } from './MarkdownPreview'
import { HTML_STYLES } from './articleHtmlStyles'

interface ArticleContentProps {
  content: string
  renderer: string
}

export function ArticleContent(
  { content, renderer }: ArticleContentProps
) {
  // Sanitised in the browser only: DOMPurify cannot run during SSR, and
  // the server must never emit unverified HTML.
  const [html, setHtml] = useState('')
  useEffect(() => { setHtml(sanitizeHtml(content)) }, [content])
  return (
    <Paper
      variant="outlined"
      sx={{ p: 4, mb: 4, borderColor: 'divider' }}
      data-testid="article-content"
    >
      {renderer === 'markdown' ? (
        <MarkdownPreview value={content} />
      ) : (
        <Box sx={HTML_STYLES} dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </Paper>
  )
}
