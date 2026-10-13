'use client'

import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Alert, Container, Link, Typography } from '@mui/material'
import VideoUploadForm from '@/components/videos/VideoUploadForm'
import { useSiteSession } from '@/hooks/useSiteSession'
import { useTenantId } from '@/hooks/useTenantId'
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { watchHref } from '@/lib/videos'

export default function VideoUploadPage() {
  const slug = useParams().slug as string
  const router = useRouter()
  const { tenantId } = useTenantId(slug)
  const signedIn = useSiteSession(slug)
  const upload = useVideoUpload(tenantId, (id) =>
    router.push(watchHref(slug, id)),
  )
  const login = `/auth/login?tenant=${encodeURIComponent(slug)}`

  return (
    <Container maxWidth="md" sx={{ py: 4 }} data-testid="video-upload-page">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload a video
      </Typography>
      {signedIn ? (
        <VideoUploadForm u={upload} />
      ) : (
        <Alert severity="info" data-testid="video-upload-signin">
          <Link component={NextLink} href={login}>
            Sign in
          </Link>{' '}
          to upload videos.
        </Alert>
      )}
    </Container>
  )
}
