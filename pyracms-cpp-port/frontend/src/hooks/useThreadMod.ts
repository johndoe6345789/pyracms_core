'use client'

import api from '@/lib/api'
import { errMsg, type ThreadInfo } from './threadTypes'

/** Post voting/editing/deleting and thread moderation calls. */
export function useThreadMod(
  threadId: string,
  thread: ThreadInfo,
  refresh: () => Promise<unknown>,
  setError: (m: string) => void,
) {
  const handleVotePost = (postId: string, isLike: boolean) =>
    api
      .post(`/api/forum/posts/${postId}/vote`, { isLike })
      .then(() => refresh())
      .catch((err) => setError(errMsg(err, 'Could not register vote.')))

  const handleEditPost = (postId: string, content: string) =>
    api.put(`/api/forum/posts/${postId}`, { content }).then(() => refresh())

  const handleDeletePost = (postId: string) =>
    api.delete(`/api/forum/posts/${postId}`).then(() => refresh())

  const setFlags = (pinned: boolean, locked: boolean) =>
    api
      .put(`/api/forum/threads/${threadId}/flags`, { pinned, locked })
      .then(() => refresh())
      .catch((err) => setError(errMsg(err, 'Action not permitted.')))

  const handleMoveThread = (forumId: string) =>
    api
      .put(`/api/forum/threads/${threadId}/move`, { forumId: Number(forumId) })
      .then(() => refresh())
      .catch((err) => setError(errMsg(err, 'Could not move the thread.')))

  return {
    handleMoveThread,
    handleVotePost,
    handleEditPost,
    handleDeletePost,
    handleTogglePin: () => setFlags(!thread.pinned, thread.locked),
    handleToggleLock: () => setFlags(thread.pinned, !thread.locked),
    handleDeleteThread: () => api.delete(`/api/forum/threads/${threadId}`),
  }
}
