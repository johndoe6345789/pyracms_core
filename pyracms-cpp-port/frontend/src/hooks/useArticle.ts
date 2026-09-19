'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { mapArticle, type Article } from './articleMapper'
import { useActionError } from './useActionError'

export type { Article }

export function useArticle(name: string, tenantId: number | null) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const { error: voteError, setError, fail } = useActionError()

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api
      .get(`/api/articles/${name}?tenant_id=${tenantId}`)
      .then((res) => setArticle(mapArticle(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId, tick])

  const handleVote = (isLike: boolean) => {
    if (!tenantId) return
    setError('')
    api
      .post(`/api/articles/${name}/vote`, {
        is_like: isLike,
        tenant_id: tenantId,
      })
      .then(() => {
        setArticle((prev) =>
          prev
            ? {
                ...prev,
                likes: prev.likes + (isLike ? 1 : 0),
                dislikes: prev.dislikes + (isLike ? 0 : 1),
              }
            : prev,
        )
      })
      .catch(fail('Could not record vote'))
  }

  const refresh = () => setTick((t) => t + 1)

  return { article, loading, voteError, handleVote, refresh }
}
