'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { formatForumDate } from '@/lib/forumDate'
import { useForumUser } from './useForumUser'

export interface Post {
  id: string
  author: string
  date: string
  content: string
  likes: number
  dislikes: number
  isOwner: boolean
}

export interface ThreadInfo {
  title: string
  description: string
  forumId: string
  forumName: string
  pinned: boolean
  locked: boolean
  views: number
}

interface RawPost {
  id: number
  username?: string
  createdAt?: string
  content?: string
  likes?: number
  dislikes?: number
  userId?: number
}

const EMPTY: ThreadInfo = {
  title: '', description: '', forumId: '', forumName: '',
  pinned: false, locked: false, views: 0,
}

function errMsg(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } }
  return e?.response?.data?.error || fallback
}

/**
 * Manages a forum thread: posts, replies, voting, editing,
 * quoting, moderation and deletion.
 * @param threadId - The thread ID to load.
 * @param tenantId - Tenant the thread must belong to.
 */
export function useThread(threadId: string, tenantId: number | null) {
  const { userId, isModerator } = useForumUser()
  const [thread, setThread] = useState<ThreadInfo>(EMPTY)
  const [rawPosts, setRawPosts] = useState<RawPost[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyError, setReplyError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchThread = useCallback(() => {
    if (!threadId || !tenantId) return Promise.resolve()
    return api
      .get(`/api/forum/threads/${threadId}?tenant_id=${tenantId}`)
      .then((res) => {
        const d = res.data
        setThread({
          title: d.name || '',
          description: d.description || '',
          forumId: String(d.forumId ?? ''),
          forumName: d.forumName || '',
          pinned: Boolean(d.pinned),
          locked: Boolean(d.locked),
          views: d.viewCount || 0,
        })
        setRawPosts(d.posts || [])
        setError('')
      })
      .catch((err) => setError(
        err?.response?.status === 404
          ? 'This thread does not exist.'
          : 'Could not load the thread. Please try again.',
      ))
  }, [threadId, tenantId])

  useEffect(() => {
    setLoading(true)
    fetchThread().finally(() => setLoading(false))
  }, [fetchThread])

  const posts: Post[] = rawPosts.map((p) => ({
    id: String(p.id),
    author: p.username || 'Unknown',
    date: formatForumDate(p.createdAt),
    content: p.content || '',
    likes: p.likes || 0,
    dislikes: p.dislikes || 0,
    isOwner: isModerator || (userId !== null && p.userId === userId),
  }))

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !threadId) return Promise.resolve()
    setSubmitting(true)
    setReplyError('')
    return api
      .post('/api/forum/posts', {
        threadId: Number(threadId),
        content: replyContent.trim(),
      })
      .then(() => {
        setReplyContent('')
        return fetchThread()
      })
      .catch((err) => setReplyError(errMsg(err, 'Could not post reply.')))
      .finally(() => setSubmitting(false))
  }

  const handleQuote = (author: string, content: string) => {
    const quote = `[quote=${author}]${content}[/quote]\n\n`
    setReplyContent((prev) => (prev ? `${prev}\n\n${quote}` : quote))
  }

  const handleVotePost = (postId: string, isLike: boolean) =>
    api
      .post(`/api/forum/posts/${postId}/vote`, { isLike })
      .then(() => fetchThread())
      .catch((err) => setReplyError(errMsg(err, 'Could not register vote.')))

  const handleEditPost = (postId: string, content: string) =>
    api
      .put(`/api/forum/posts/${postId}`, { content })
      .then(() => fetchThread())

  const handleDeletePost = (postId: string) =>
    api
      .delete(`/api/forum/posts/${postId}`)
      .then(() => fetchThread())

  const setFlags = (pinned: boolean, locked: boolean) =>
    api
      .put(`/api/forum/threads/${threadId}/flags`, { pinned, locked })
      .then(() => fetchThread())
      .catch((err) => setReplyError(errMsg(err, 'Action not permitted.')))

  const handleTogglePin = () => setFlags(!thread.pinned, thread.locked)
  const handleToggleLock = () => setFlags(thread.pinned, !thread.locked)

  const handleDeleteThread = () =>
    api.delete(`/api/forum/threads/${threadId}`)

  return {
    thread,
    posts,
    replyContent,
    setReplyContent,
    loading,
    error,
    replyError,
    submitting,
    handleSubmitReply,
    handleQuote,
    handleVotePost,
    handleEditPost,
    handleDeletePost,
    handleTogglePin,
    handleToggleLock,
    handleDeleteThread,
  }
}
