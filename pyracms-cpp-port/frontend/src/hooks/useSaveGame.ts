'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface GameFields {
  displayName: string
  description: string
  tags: string[]
}

/** Saves the edited game, then returns to its page. */
export function useSaveGame(slug: string, name: string) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const save = (fields: GameFields) => {
    setSaving(true)
    return api.put(`/api/gamedep/game/item/${name}`, fields)
      .then(() => router.push(`/site/${slug}/games/${name}`))
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  return { saving, save }
}
