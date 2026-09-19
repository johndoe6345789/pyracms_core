'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useForumUser } from './useForumUser'
import { useThreadReply } from './useThreadReply'
import { useThreadMod } from './useThreadMod'
import {
  EMPTY_THREAD,
  mapPosts,
  mapThread,
  type RawPost,
  type ThreadInfo,
} from './threadTypes'

export type { Post, ThreadInfo } from './threadTypes'

/**
 * Manages a forum thread: posts, replies, voting, editing,
 * quoting, moderation and deletion.
 * @param threadId - The thread ID to load.
 * @param tenantId - Tenant the thread must belong to.
 */
export function useThread(threadId: string, tenantId: number | null) {
  const { userId, isModerator } = useForumUser()
  const [thread, setThread] = useState<ThreadInfo>(EMPTY_THREAD)
  const [rawPosts, setRawPosts] = useState<RawPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchThread = useCallback(() => {
    if (!threadId || !tenantId) return Promise.resolve()
    return api
      .get(`/api/forum/threads/${threadId}?tenant_id=${tenantId}`)
      .then((res) => {
        setThread(mapThread(res.data))
        setRawPosts(res.data.posts || [])
        setError('')
      })
      .catch((err) =>
        setError(
          err?.response?.status === 404
            ? 'This thread does not exist.'
            : 'Could not load the thread. Please try again.',
        ),
      )
  }, [threadId, tenantId])

  useEffect(() => {
    setLoading(true)
    fetchThread().finally(() => setLoading(false))
  }, [fetchThread])

  const reply = useThreadReply(threadId, fetchThread)
  const mod = useThreadMod(threadId, thread, fetchThread, reply.setReplyError)

  return {
    thread,
    posts: mapPosts(rawPosts, userId, isModerator),
    loading,
    error,
    refresh: fetchThread,
    replyContent: reply.replyContent,
    setReplyContent: reply.setReplyContent,
    replyError: reply.replyError,
    submitting: reply.submitting,
    handleSubmitReply: reply.handleSubmitReply,
    handleQuote: reply.handleQuote,
    ...mod,
  }
}
