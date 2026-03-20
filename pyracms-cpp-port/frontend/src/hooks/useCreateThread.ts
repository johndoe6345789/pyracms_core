'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export function useCreateThread(forumId: string) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    setLoading(true)
    setError('')
    api.post('/api/forum/threads', {
      title: title.trim(),
      content: content.trim(),
      forumId: Number(forumId),
    })
      .then(res => {
        const threadId = res.data.id
        router.push(`../thread/${threadId}`)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to create thread')
      })
      .finally(() => setLoading(false))
  }

  return { title, setTitle, description, setDescription, content, setContent, loading, error, handleSubmit }
}
