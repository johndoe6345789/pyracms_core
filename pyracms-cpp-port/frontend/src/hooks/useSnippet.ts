'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { mapSnippet, type Snippet } from '@/lib/snippets'

export function useSnippet(id: string) {
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    api
      .get(`/api/snippets/${id}`)
      .then((res) => setSnippet(mapSnippet(res.data)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { snippet, loading, notFound, reload }
}
