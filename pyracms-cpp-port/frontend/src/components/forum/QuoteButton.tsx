'use client'

import { Button } from '@mui/material'
import { FormatQuoteOutlined } from '@mui/icons-material'

interface QuoteButtonProps {
  author: string
  content: string
  onQuote: (quotedText: string) => void
}

export function QuoteButton({ author, content, onQuote }: QuoteButtonProps) {
  const handleQuote = () => {
    const quotedText = `[quote=${author}]${content}[/quote]\n\n`
    onQuote(quotedText)
  }

  return (
    <Button
      size="small"
      variant="text"
      startIcon={<FormatQuoteOutlined />}
      onClick={handleQuote}
      sx={{ textTransform: 'none' }}
    >
      Quote
    </Button>
  )
}
