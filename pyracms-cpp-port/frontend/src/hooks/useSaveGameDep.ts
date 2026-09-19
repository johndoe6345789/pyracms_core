'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import type { GameDepType } from '@/hooks/useGameDepItem'

export interface GameDepFields {
  displayName: string
  description: string
  tags: string[]
}

export const GAMEDEP_SECTION = { game: 'games', dep: 'dependencies' } as const

/** Saves an edited game/dependency, then returns to its page. */
export function useSaveGameDep(type: GameDepType, slug: string, name: string) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = (fields: GameDepFields) => {
    setSaving(true)
    setError('')
    const base = `/api/gamedep/${type}/${encodeURIComponent(name)}`
    const { tags, ...page } = fields
    // Tags live on their own endpoint
    return api
      .put(base, page)
      .then(() => api.put(`${base}/tags`, { tags }))
      .then(() => router.push(`/site/${slug}/${GAMEDEP_SECTION[type]}/${name}`))
      .catch((e) => setError(apiErrorMessage(e, 'Could not save changes')))
      .finally(() => setSaving(false))
  }

  return { saving, error, save }
}
