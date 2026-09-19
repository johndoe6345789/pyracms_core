'use client'

import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import Link from 'next/link'
import { langColor } from '@/lib/snippets'
import { SnippetCardMeta } from './SnippetCardMeta'
import { SnippetPreview } from './SnippetPreview'
import { SnippetCardActions } from './SnippetCardActions'

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

export function SnippetCard({
  id,
  title,
  language,
  code,
  author,
  date,
  runCount,
  siteSlug,
  onFork,
  onShare,
}: SnippetCardProps) {
  const color = langColor(language)
  const snippetUrl = `/site/${siteSlug}/snippets/${id}`

  const handleShare = () => {
    if (onShare) return onShare()
    navigator.clipboard.writeText(`${window.location.origin}${snippetUrl}`)
  }

  return (
    <Card
      variant="outlined"
      data-testid={`snippet-card-${id}`}
      sx={{
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            component={Link}
            href={snippetUrl}
            data-testid={`snippet-link-${id}`}
            sx={{
              fontWeight: 600,
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {title}
          </Typography>
          <Chip
            label={language}
            size="small"
            sx={{
              bgcolor: color + '20',
              color,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        </Box>
        <SnippetPreview code={code} />
        <SnippetCardMeta author={author} date={date} runCount={runCount} />
      </CardContent>
      <SnippetCardActions
        id={id}
        title={title}
        href={snippetUrl}
        onFork={onFork}
        onShare={handleShare}
      />
    </Card>
  )
}
