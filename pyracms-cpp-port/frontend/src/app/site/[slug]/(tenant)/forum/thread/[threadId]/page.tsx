'use client'

import { useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import { useThread } from '@/hooks/useThread'
import {
  BackButton,
} from '@/components/common/BackButton'
import {
  PostCard,
} from '@/components/forum/PostCard'
import {
  QuickReplyForm,
} from '@/components/forum/QuickReplyForm'

export default function ViewThreadPage() {
  const params = useParams()
  const slug = params.slug as string
  const threadId = params.threadId as string
  const {
    thread,
    posts,
    replyContent,
    setReplyContent,
    handleSubmitReply,
    handleVotePost,
    handleEditPost,
    handleDeletePost,
  } = useThread(threadId)

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="view-thread-page"
    >
      <Box sx={{ mb: 2 }}>
        <BackButton
          href={`/site/${slug}/forum`}
          label="Back to Forum"
        />
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
        >
          {thread.title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          {thread.description}
        </Typography>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        data-testid="posts-list"
        role="list"
        aria-label="Thread posts"
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onVote={handleVotePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        ))}
      </Box>
      <QuickReplyForm
        value={replyContent}
        onChange={setReplyContent}
        onSubmit={handleSubmitReply}
      />
    </Container>
  )
}
