'use client'

import { useParams, useRouter } from 'next/navigation'
import { Alert, Container, Grid } from '@mui/material'
import CommentSection from '@/components/common/CommentSection'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useGuardedAction } from '@/components/gallery/useGuardedAction'
import UpNext from '@/components/videos/UpNext'
import VideoManageDialogs from '@/components/videos/VideoManageDialogs'
import WatchDetails from '@/components/videos/WatchDetails'
import { useCanManage } from '@/hooks/useCanManage'
import { useSiteSession } from '@/hooks/useSiteSession'
import { useTenantId } from '@/hooks/useTenantId'
import { useVideo } from '@/hooks/useVideo'
import { useVideoList } from '@/hooks/useVideoList'
import { useVideoManage } from '@/hooks/useVideoManage'
import { videosHref } from '@/lib/videos'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const { video, missing, vote, update, remove } = useVideo(
    params.videoId as string,
    tenantId,
  )
  const signedIn = useSiteSession(slug)
  const canManage = useCanManage(slug, video?.userId ?? null)
  const { error, guard } = useGuardedAction()
  const manage = useVideoManage(video, update, remove, () =>
    router.push(videosHref(slug)),
  )
  const next = useVideoList(tenantId, { sort: 'popular', limit: 10 })

  if (missing)
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info" data-testid="video-missing">
          This video is not available.
        </Alert>
      </Container>
    )
  if (!video) return null
  return (
    <Container maxWidth="xl" sx={{ py: 3 }} data-testid="video-watch-page">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <WatchDetails
            slug={slug}
            video={video}
            canVote={signedIn}
            canManage={canManage}
            onVote={(like) => guard(() => vote(like), 'Could not vote')}
            onEdit={() => manage.open('edit')}
            onDelete={() => manage.open('delete')}
          />
          <ErrorAlert error={error} testId="video-error" />
          <CommentSection contentType="video" contentId={video.id} />
        </Grid>
        <Grid item xs={12} md={4}>
          <UpNext
            slug={slug}
            items={next.items.filter((v) => v.id !== video.id)}
          />
        </Grid>
      </Grid>
      <VideoManageDialogs m={manage} />
    </Container>
  )
}
