'use client'

import { Box } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MARKDOWN_STYLES = {
  '& h1': {
    fontSize: '2rem',
    fontWeight: 700,
    mt: 3,
    mb: 1,
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 600,
    mt: 2,
    mb: 1,
  },
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 600,
    mt: 2,
    mb: 1,
  },
  '& p': { mb: 2, lineHeight: 1.8 },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& blockquote': {
    borderLeft: '3px solid',
    borderColor: 'divider',
    pl: 2,
    ml: 0,
    color: 'text.secondary',
  },
  '& pre': {
    bgcolor: '#1e293b',
    color: '#e2e8f0',
    p: 2,
    borderRadius: 1,
    overflow: 'auto',
  },
  '& code': {
    bgcolor: '#f1f5f9',
    px: 0.5,
    borderRadius: 0.5,
    fontSize: '0.875rem',
  },
  '& pre code': {
    bgcolor: 'transparent',
    p: 0,
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    mb: 2,
  },
  '& th, & td': {
    border: '1px solid',
    borderColor: 'divider',
    px: 2,
    py: 1,
  },
  '& th': {
    bgcolor: 'background.default',
    fontWeight: 600,
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
  },
  '& input[type="checkbox"]': { mr: 1 },
}

interface MarkdownPreviewProps {
  value: string
}

export function MarkdownPreview({
  value,
}: MarkdownPreviewProps) {
  return (
    <Box
      sx={MARKDOWN_STYLES}
      data-testid="markdown-preview"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      >
        {value || '*Nothing to preview yet.*'}
      </ReactMarkdown>
    </Box>
  )
}
