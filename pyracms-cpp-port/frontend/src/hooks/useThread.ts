'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

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
}

export function useThread(threadId: string) {
  const [thread, setThread] = useState<ThreadInfo>({ title: '', description: '' })
  const [posts, setPosts] = useState<Post[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchThread = () => {
    if (!threadId) return
    api.get(`/api/forum/threads/${threadId}`)
      .then(res => {
        const data = res.data
        setThread({ title: data.title || '', description: data.content || '' })
        const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        const mapped: Post[] = (data.posts || []).map((p: Record<string, unknown>) => ({
          id: String(p.id),
          author: p.authorUsername || 'Unknown',
          date: typeof p.createdAt === 'string' ? (p.createdAt as string).replace('T', ' ').substring(0, 16) : '',
          content: p.content || '',
          likes: p.likes || 0,
          dislikes: p.dislikes || 0,
          isOwner: currentUserId ? String(p.authorId) === currentUserId : false,
        }))
        setPosts(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    fetchThread()
  }, [threadId])

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !threadId) return Promise.reject()
    return api.post('/api/forum/posts', { threadId: Number(threadId), content: replyContent })
      .then(() => {
        setReplyContent('')
        fetchThread()
      })
  }

  const handleVotePost = (postId: string, isLike: boolean) => {
    return api.post(`/api/forum/posts/${postId}/vote`, { like: isLike })
      .then(() => {
        setPosts(prev => prev.map(p =>
          p.id === postId ? {
            ...p,
            likes: p.likes + (isLike ? 1 : 0),
            dislikes: p.dislikes + (isLike ? 0 : 1),
          } : p
        ))
      })
      .catch(() => {})
  }

  const handleEditPost = (postId: string, content: string) => {
    return api.put(`/api/forum/posts/${postId}`, { content })
      .then(() => {
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, content } : p
        ))
      })
  }

  const handleDeletePost = (postId: string) => {
    return api.delete(`/api/forum/posts/${postId}`)
      .then(() => {
        setPosts(prev => prev.filter(p => p.id !== postId))
      })
  }

  return { thread, posts, replyContent, setReplyContent, loading, handleSubmitReply, handleVotePost, handleEditPost, handleDeletePost }
}
