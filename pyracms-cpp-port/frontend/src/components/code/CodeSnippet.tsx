import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  PlayArrowOutlined,
  EditOutlined,
} from '@mui/icons-material'
import CodeResult from './CodeResult'
import type {
  CodeSnippetData,
} from '@/hooks/useCodeAlbum'

interface CodeSnippetProps {
  snippet: CodeSnippetData
  onRun?: (
    snippetId: string,
  ) => Promise<string>
  onEdit?: (snippetId: string) => void
}

export default function CodeSnippet(
  { snippet, onRun, onEdit }:
  CodeSnippetProps,
) {
  const [running, setRunning] =
    useState(false)
  const [result, setResult] =
    useState(snippet.result)

  const handleRun = () => {
    if (!onRun) return
    setRunning(true)
    onRun(snippet.id)
      .then(output =>
        setResult(output),
      )
      .catch(() =>
        setResult(
          'Error running snippet',
        ),
      )
      .finally(() => setRunning(false))
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        overflow: 'hidden',
      }}
      data-testid={
        `code-snippet-${snippet.id}`
      }
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor:
            'background.default',
        }}
      >
        <Typography
          variant="h5"
          component="h2"
        >
          {snippet.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={
              running
                ? (
                  <CircularProgress
                    size={16}
                  />
                )
                : <PlayArrowOutlined />
            }
            color="success"
            onClick={handleRun}
            disabled={running}
            data-testid={
              `run-snippet-`
              + `${snippet.id}`
            }
            aria-label={
              `Run ${snippet.title}`
            }
          >
            {running
              ? 'Running...'
              : 'Run'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              <EditOutlined />
            }
            onClick={() =>
              onEdit?.(snippet.id)
            }
            data-testid={
              `edit-snippet-`
              + `${snippet.id}`
            }
            aria-label={
              `Edit ${snippet.title}`
            }
          >
            Edit
          </Button>
        </Box>
      </Box>
      <Divider />
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 3,
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontFamily:
            '"Fira Code", '
            + '"JetBrains Mono", '
            + '"Cascadia Code", '
            + 'monospace',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
      >
        <code>{snippet.code}</code>
      </Box>
      {result && (
        <CodeResult result={result} />
      )}
    </Paper>
  )
}
