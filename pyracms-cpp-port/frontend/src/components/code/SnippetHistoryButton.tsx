'use client'

import Link from 'next/link'
import { Button } from '@mui/material'
import { HistoryOutlined } from '@mui/icons-material'

export function SnippetHistoryButton({ href }: { href: string }) {
  return (
    <Button
      variant="outlined"
      startIcon={<HistoryOutlined />}
      component={Link}
      href={href}
      data-testid="history-btn"
    >
      History
    </Button>
  )
}
