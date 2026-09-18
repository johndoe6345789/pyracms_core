'use client'

import { useRef, useState } from 'react'
import { Divider } from '@mui/material'
import type { useThread } from '@/hooks/useThread'
import { useThreadLive } from '@/hooks/useThreadLive'
import { useForumUser } from '@/hooks/useForumUser'
import { PostList } from './PostList'
import { ThreadHeader } from './ThreadHeader'
import { TypingIndicator } from './TypingIndicator'
import { QuickReplyForm } from './QuickReplyForm'
import { ThreadActions } from './ThreadActions'

interface Props {
  t: ReturnType<typeof useThread>
  threadId: string
  onDeleted: () => void
}

/** Header, posts, live typing hint and reply form of a thread. */
export function ThreadContent({ t, threadId, onDeleted }: Props) {
  const { isAuthenticated, isModerator } = useForumUser()
  const { thread } = t
  const live = useThreadLive({
    threadId: Number(threadId) || 0,
    onNewPost: () => { t.refresh() },
  })
  const [page, setPage] = useState(1)
  const lastTyping = useRef(0)

  const onTyping = () => {
    if (Date.now() - lastTyping.current < 3000) return
    lastTyping.current = Date.now()
    live.sendTypingStart()
  }
  // Jump to the last page after posting (the new reply is at the end).
  const onSubmit = () => t.handleSubmitReply().then(() => setPage(9999))

  return (
    <>
      <ThreadHeader
        thread={thread}
        actions={
          <ThreadActions
            threadId={threadId}
            isPinned={thread.pinned}
            isLocked={thread.locked}
            isModerator={isModerator}
            onPin={t.handleTogglePin}
            onLock={t.handleToggleLock}
            onDelete={() => t.handleDeleteThread().then(onDeleted)}
          />
        }
      />
      <Divider sx={{ mb: 4 }} />
      <PostList
        posts={t.posts}
        page={page}
        onPage={setPage}
        canVote={isAuthenticated}
        canQuote={!thread.locked && isAuthenticated}
        onVote={t.handleVotePost}
        onEdit={t.handleEditPost}
        onDelete={t.handleDeletePost}
        onQuote={t.handleQuote}
      />
      <TypingIndicator count={live.typingUsers.length} />
      <QuickReplyForm
        value={t.replyContent}
        onChange={t.setReplyContent}
        onSubmit={onSubmit}
        onTyping={onTyping}
        submitting={t.submitting}
        error={t.replyError}
        locked={thread.locked}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}
