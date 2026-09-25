'use client'

import { Card, CardActionArea, CardContent } from '@mui/material'
import Link from 'next/link'
import { SnippetCardTitle } from './SnippetCardTitle'
import { SnippetCardMeta } from './SnippetCardMeta'
import { SnippetPreview } from './SnippetPreview'
import { SnippetCardActions } from './SnippetCardActions'
import { cardSx, actionSx } from './snippetCardStyles'

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
    <Card variant="outlined" data-testid={`snippet-card-${id}`} sx={cardSx}>
      {/* Whole body is the link (bigger click target than the old title-only
          link), so it lives outside the Fork/Share footer below. */}
      <CardActionArea
        component={Link}
        href={snippetUrl}
        data-testid={`snippet-link-${id}`}
        aria-label={`View ${title}`}
        sx={actionSx}
      >
        <CardContent sx={{ pb: 1 }}>
          <SnippetCardTitle title={title} language={language} />
          <SnippetPreview code={code} />
          <SnippetCardMeta author={author} date={date} runCount={runCount} />
        </CardContent>
      </CardActionArea>
      <SnippetCardActions
        id={id}
        title={title}
        onFork={onFork}
        onShare={handleShare}
      />
    </Card>
  )
}
