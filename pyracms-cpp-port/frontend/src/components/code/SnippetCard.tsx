'use client'

import { Card, CardContent, CardActions, Typography, Box, Chip, IconButton, Tooltip, Button } from '@mui/material'
import { ForkRightOutlined, ShareOutlined, PlayArrowOutlined, VisibilityOutlined } from '@mui/icons-material'
import Link from 'next/link'

interface SnippetCardProps {
  id: string
  title: string
  language: string
  code: string
  author: string
  date: string
  runCount: number
  siteSlug: string
  onFork?: () => void
  onShare?: () => void
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: '#3572A5',
  javascript: '#f1e05a',
  typescript: '#2b7489',
  cpp: '#f34b7d',
  rust: '#dea584',
  go: '#00ADD8',
  java: '#b07219',
  ruby: '#701516',
}

export function SnippetCard({ id, title, language, code, author, date, runCount, siteSlug, onFork, onShare }: SnippetCardProps) {
  const previewLines = code.split('\n').slice(0, 6).join('\n')
  const langColor = LANGUAGE_COLORS[language] ?? '#6e7681'

  const handleShare = () => {
    if (onShare) { onShare() } else { navigator.clipboard.writeText(`${window.location.origin}/site/${siteSlug}/snippets/${id}`) }
  }

  return (
    <Card variant="outlined" sx={{ borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" component={Link} href={`/site/${siteSlug}/snippets/${id}`} sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
            {title}
          </Typography>
          <Chip label={language} size="small" sx={{ bgcolor: langColor + '20', color: langColor, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
        </Box>
        <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: '#1e293b', color: '#e2e8f0', fontFamily: '"Fira Code", monospace', fontSize: '0.75rem', lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'pre', borderRadius: 1, maxHeight: 120, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(transparent, #1e293b)' } }}>
          <code>{previewLines}</code>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">{author}</Typography>
          <Typography variant="caption" color="text.secondary">{date}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <PlayArrowOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{runCount} runs</Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
        <Button size="small" component={Link} href={`/site/${siteSlug}/snippets/${id}`} startIcon={<VisibilityOutlined />}>View</Button>
        <Tooltip title="Fork snippet"><IconButton size="small" onClick={onFork}><ForkRightOutlined fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Share"><IconButton size="small" onClick={handleShare}><ShareOutlined fontSize="small" /></IconButton></Tooltip>
      </CardActions>
    </Card>
  )
}
