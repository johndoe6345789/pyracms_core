'use client'

import { useState } from 'react'
import { Box, Button, Tooltip } from '@mui/material'
import {
  PlayArrowOutlined, ForkRightOutlined,
  ShareOutlined, ContentCopyOutlined,
  EditOutlined, DeleteOutlined, CheckOutlined,
} from '@mui/icons-material'

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
  runnable, running, isOwner, code,
  onRun, onFork, onEdit, onDelete,
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
      <Tooltip title={runnable ? '' :
        'Running is not supported for this language'}>
        <span>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowOutlined />}
            onClick={onRun}
            disabled={running || !runnable}
            data-testid="run-snippet-btn"
            aria-label="Run snippet"
          >
            {running ? 'Running...' : 'Run'}
          </Button>
        </span>
      </Tooltip>
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
      <Button
        variant="outlined"
        startIcon={<ForkRightOutlined />}
        onClick={onFork}
        data-testid="fork-snippet-btn"
        aria-label="Fork snippet"
      >
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
      {isOwner && (
        <>
          <Button
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={onEdit}
            data-testid="edit-snippet-btn"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={onDelete}
            data-testid="delete-snippet-btn"
          >
            Delete
          </Button>
        </>
      )}
    </Box>
  )
}
