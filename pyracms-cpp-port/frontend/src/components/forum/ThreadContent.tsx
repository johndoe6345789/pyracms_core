'use client'

import { Divider } from '@mui/material'
import type { useThread } from '@/hooks/useThread'
import { useForumUser } from '@/hooks/useForumUser'
import { PostList } from './PostList'
import { ThreadHeader } from './ThreadHeader'
import { TypingIndicator } from './TypingIndicator'
import { QuickReplyForm } from './QuickReplyForm'
import { useThreadContentState } from './useThreadContentState'
import { ThreadModActions } from './ThreadModActions'

interface Props {
  t: ReturnType<typeof useThread>
  threadId: string
  tenantId?: number | null
  onDeleted: () => void
}

/** Header, posts, live typing hint and reply form of a thread. */
export function ThreadContent({
  t,
  threadId,
  tenantId = null,
  onDeleted,
}: Props) {
  const { isAuthenticated, isModerator } = useForumUser()
  const { thread } = t
  const { live, page, setPage, onTyping, onSubmit } =
    useThreadContentState(t, threadId)
  return (
    <>
      <ThreadHeader
        thread={thread}
        actions={
          <ThreadModActions
            threadId={threadId}
            tenantId={tenantId}
            isPinned={thread.pinned}
            isLocked={thread.locked}
            isModerator={isModerator}
            onPin={t.handleTogglePin}
            onLock={t.handleToggleLock}
            onMove={t.handleMoveThread}
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
        tenantId={tenantId}
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
