'use client'

import { Box } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MARKDOWN_STYLES } from './markdownStyles'

interface MarkdownPreviewProps {
  value: string
}

export function MarkdownPreview({ value }: MarkdownPreviewProps) {
  return (
    <Box sx={MARKDOWN_STYLES} data-testid="markdown-preview">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {value || '*Nothing to preview yet.*'}
      </ReactMarkdown>
    </Box>
  )
}
