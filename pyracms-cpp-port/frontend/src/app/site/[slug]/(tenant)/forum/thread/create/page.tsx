'use client'

import {
  useParams,
  useSearchParams,
} from 'next/navigation'
import {
  Container,
  Typography,
  Box,
} from '@mui/material'
import {
  useCreateThread,
} from '@/hooks/useCreateThread'
import {
  BackButton,
} from '@/components/common/BackButton'
import {
  CreateThreadForm,
} from '@/components/forum/CreateThreadForm'

export default function CreateThreadPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const forumId =
    searchParams.get('forumId') || '1'
  const {
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    loading,
    error,
    handleSubmit,
  } = useCreateThread(forumId)

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="create-thread-page"
    >
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={`/site/${slug}/forum`}
          label="Back to Forum"
        />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ mt: 2 }}
        >
          Create New Thread
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Start a new discussion topic
          in the forum.
        </Typography>
      </Box>
      <CreateThreadForm
        slug={slug}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        content={content}
        setContent={setContent}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </Container>
  )
}
