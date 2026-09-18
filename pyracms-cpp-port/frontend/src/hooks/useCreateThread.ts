'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export function useCreateThread(
  forumId: string,
  slug: string,
  tenantId: number | null,
) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    if (!forumId) {
      setError('Choose a forum first.')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    setLoading(true)
    setError('')
    api.post('/api/forum/threads', {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      forumId: Number(forumId),
      tenantId: tenantId ?? 0,
    })
      .then(res => {
        const id = res.data?.id
        router.push(
          id
            ? `/site/${slug}/forum/thread/${id}`
            : `/site/${slug}/forum/${forumId}`,
        )
      })
      .catch(err => {
        setError(
          err.response?.data?.error
          || err.response?.data?.message
          || 'Failed to create thread',
        )
        setLoading(false)
      })
  }

  return {
    title, setTitle, description, setDescription,
    content, setContent, loading, error, handleSubmit,
  }
}
