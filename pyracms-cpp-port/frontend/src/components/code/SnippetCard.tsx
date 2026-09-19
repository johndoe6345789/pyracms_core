'use client'

import { Card, CardContent } from '@mui/material'
import { SnippetCardTitle } from './SnippetCardTitle'
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
        <SnippetCardTitle
          id={id}
          title={title}
          language={language}
          href={snippetUrl}
        />
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
