'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button, Chip, Divider, Paper, TextField, Avatar } from '@mui/material'
import { PlayArrowOutlined, ForkRightOutlined, ShareOutlined, SendOutlined } from '@mui/icons-material'
import { BackButton } from '@/components/common/BackButton'
import { CodeOutput } from '@/components/code/CodeOutput'

const PLACEHOLDER_SNIPPET = {
  id: 'snippet-1',
  title: 'Fibonacci Sequence',
  language: 'python',
  code: 'def fibonacci(n):\n    """Generate Fibonacci sequence up to n terms."""\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(10))',
  author: 'Alice',
  date: '2026-03-15',
  runCount: 42,
}

const PLACEHOLDER_COMMENTS = [
  { id: '1', author: 'Bob', date: '2026-03-16', content: 'Nice implementation! You could also use a generator for memory efficiency.' },
  { id: '2', author: 'Charlie', date: '2026-03-17', content: 'Great example. I adapted this for my project.' },
]

export default function ViewSnippetPage() {
  const params = useParams()
  const slug = params.slug as string
  const snippet = PLACEHOLDER_SNIPPET
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout?: string; exitCode?: number; executionTime?: number } | null>(null)
  const [commentText, setCommentText] = useState('')

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => {
      setOutput({ stdout: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', exitCode: 0, executionTime: 45 })
      setIsRunning(false)
    }, 1000)
  }

  const handleFork = () => { console.log('Fork snippet') }
  const handleShare = () => { navigator.clipboard.writeText(window.location.href) }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 2 }}><BackButton href={`/site/${slug}/snippets`} label="Back to Snippets" /></Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1">{snippet.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip label={snippet.language} size="small" color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">by {snippet.author}</Typography>
            <Typography variant="body2" color="text.secondary">{snippet.date}</Typography>
            <Typography variant="body2" color="text.secondary">{snippet.runCount} runs</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="success" startIcon={<PlayArrowOutlined />} onClick={handleRun} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button variant="outlined" startIcon={<ForkRightOutlined />} onClick={handleFork}>Fork</Button>
          <Button variant="outlined" startIcon={<ShareOutlined />} onClick={handleShare}>Share</Button>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
        <Box component="pre" sx={{ m: 0, p: 3, bgcolor: '#1e293b', color: '#e2e8f0', fontFamily: '"Fira Code", "JetBrains Mono", monospace', fontSize: '0.875rem', lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre' }}>
          <code>{snippet.code}</code>
        </Box>
      </Paper>

      {(isRunning || output) && (
        <Box sx={{ mb: 3 }}>
          <CodeOutput stdout={output?.stdout} exitCode={output?.exitCode ?? undefined} executionTime={output?.executionTime ?? undefined} isLoading={isRunning} />
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>Comments</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {PLACEHOLDER_COMMENTS.map((comment) => (
          <Paper key={comment.id} variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{comment.author.charAt(0)}</Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{comment.author}</Typography>
              <Typography variant="caption" color="text.secondary">{comment.date}</Typography>
            </Box>
            <Typography variant="body2">{comment.content}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
        <TextField fullWidth multiline minRows={2} maxRows={6} placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} sx={{ mb: 1 }} />
        <Button variant="contained" size="small" endIcon={<SendOutlined />} disabled={!commentText}>Post Comment</Button>
      </Paper>
    </Container>
  )
}
