'use client'

import { useState } from 'react'
import { Box, Button } from '@mui/material'
import {
  ForkRightOutlined, ShareOutlined, ContentCopyOutlined, CheckOutlined,
} from '@mui/icons-material'
import { RunButton } from './RunButton'
import { OwnerButtons } from './OwnerButtons'

interface Props {
  runnable: boolean
  running: boolean
  isOwner: boolean
  code: string
  onRun: () => void
  onFork: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SnippetToolbar({
  runnable, running, isOwner, code, onRun, onFork, onEdit, onDelete,
}: Props) {
  const [copied, setCopied] = useState('')

  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text)
      .then(() => {
        setCopied(what)
        setTimeout(() => setCopied(''), 1500)
      })
      .catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <RunButton label="Run" runningLabel="Running..."
        testId="run-snippet-btn" running={running}
        runnable={runnable} onClick={onRun} />
      <Button
        variant="outlined"
        startIcon={copied === 'code'
          ? <CheckOutlined /> : <ContentCopyOutlined />}
        onClick={() => copy('code', code)}
        data-testid="copy-snippet-btn"
        aria-label="Copy code"
      >
        {copied === 'code' ? 'Copied' : 'Copy'}
      </Button>
      <Button variant="outlined" startIcon={<ForkRightOutlined />}
        onClick={onFork} data-testid="fork-snippet-btn"
        aria-label="Fork snippet">
        Fork
      </Button>
      <Button
        variant="outlined"
        startIcon={copied === 'link'
          ? <CheckOutlined /> : <ShareOutlined />}
        onClick={() => copy('link', window.location.href)}
        data-testid="share-snippet-btn"
        aria-label="Share snippet"
      >
        {copied === 'link' ? 'Link copied' : 'Share'}
      </Button>
      {isOwner && <OwnerButtons onEdit={onEdit} onDelete={onDelete} />}
    </Box>
  )
}
