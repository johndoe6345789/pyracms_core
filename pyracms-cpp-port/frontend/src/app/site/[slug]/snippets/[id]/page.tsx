'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Container, Typography, Box, Button, Chip, Divider, Paper, TextField, Avatar } from '@mui/material'
import { PlayArrowOutlined, ForkRightOutlined, ShareOutlined, SendOutlined } from '@mui/icons-material'
import { BackButton } from '@/components/common/BackButton'
import { CodeOutput } from '@/components/code/CodeOutput'
import { useTenantId } from '@/hooks/useTenantId'
import api from '@/lib/api'

interface SnippetDetail {
  id: string
  title: string
  language: string
  code: string
  author: string
  date: string
  runCount: number
}

export default function ViewSnippetPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const snippetId = params.id as string
  const { tenantId } = useTenantId(slug)
  const [snippet, setSnippet] = useState<SnippetDetail | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout?: string; exitCode?: number; executionTime?: number } | null>(null)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    api.get(`/api/snippets/${snippetId}`)
      .then(res => {
        const s = res.data
        setSnippet({
          id: String(s.id),
          title: s.title || '',
          language: s.language || '',
          code: s.code || '',
          author: s.authorUsername || 'Unknown',
          date: s.createdAt?.split('T')[0] || '',
          runCount: s.runCount || 0,
        })
      })
      .catch(() => {})
  }, [snippetId])

  const handleRun = () => {
    setIsRunning(true)
    api.post(`/api/snippets/${snippetId}/run`)
      .then(res => {
        setOutput({ stdout: res.data.output || res.data.stdout || '', exitCode: res.data.exitCode ?? 0, executionTime: res.data.executionTime })
      })
      .catch(() => {
        setOutput({ stdout: 'Error running snippet', exitCode: 1 })
      })
      .finally(() => setIsRunning(false))
  }

  const handleFork = () => {
    api.post(`/api/snippets/${snippetId}/fork`)
      .then(res => {
        router.push(`/site/${slug}/snippets/${res.data.id}`)
      })
      .catch(() => {})
  }

  const handleShare = () => { navigator.clipboard.writeText(window.location.href) }

  if (!snippet) return null

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

      <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }}>
        <TextField fullWidth multiline minRows={2} maxRows={6} placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} sx={{ mb: 1 }} />
        <Button variant="contained" size="small" endIcon={<SendOutlined />} disabled={!commentText}
          onClick={() => {
            api.post(`/api/comments`, { contentType: 'snippet', contentId: Number(snippetId), content: commentText })
              .then(() => setCommentText(''))
              .catch(() => {})
          }}>
          Post Comment
        </Button>
      </Paper>
    </Container>
  )
}
