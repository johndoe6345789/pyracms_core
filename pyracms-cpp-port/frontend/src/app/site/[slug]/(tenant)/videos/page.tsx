'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import VideoGrid from '@/components/videos/VideoGrid'
import VideosHeader from '@/components/videos/VideosHeader'
import { useSiteSession } from '@/hooks/useSiteSession'
import { useTenantId } from '@/hooks/useTenantId'
import { useVideoList } from '@/hooks/useVideoList'
import type { VideoSort } from '@/lib/videos'

export default function VideosPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const signedIn = useSiteSession(slug)
  const [sort, setSort] = useState<VideoSort>('newest')
  const [q, setQ] = useState('')
  const list = useVideoList(tenantId, { sort, q })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="videos-page">
      <VideosHeader
        slug={slug}
        canUpload={signedIn}
        sort={sort}
        onSort={setSort}
        onSearch={setQ}
      />
      <VideoGrid
        slug={slug}
        items={list.items}
        loading={list.loading}
        hasMore={list.hasMore}
        onMore={list.loadMore}
        empty={q ? `No videos match "${q}".` : 'No videos yet.'}
      />
    </Container>
  )
}
