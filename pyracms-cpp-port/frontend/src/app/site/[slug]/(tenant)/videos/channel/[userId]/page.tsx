'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import ChannelHeader from '@/components/videos/ChannelHeader'
import VideoGrid from '@/components/videos/VideoGrid'
import { useChannelName } from '@/hooks/useChannelName'
import { useTenantId } from '@/hooks/useTenantId'
import { useVideoList } from '@/hooks/useVideoList'

export default function ChannelPage() {
  const params = useParams()
  const slug = params.slug as string
  const userId = Number(params.userId) || 0
  const { tenantId } = useTenantId(slug)
  const name = useChannelName(userId)
  const list = useVideoList(tenantId, { userId, sort: 'newest' })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} data-testid="video-channel-page">
      <ChannelHeader
        userId={userId}
        username={name || list.items[0]?.username || ''}
        total={list.total}
      />
      <VideoGrid
        slug={slug}
        items={list.items}
        loading={list.loading}
        hasMore={list.hasMore}
        onMore={list.loadMore}
        empty="This channel has no videos yet."
      />
    </Container>
  )
}
