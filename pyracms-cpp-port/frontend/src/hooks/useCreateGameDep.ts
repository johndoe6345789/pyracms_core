'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { tenantParams } from '@/lib/tenantParams'
import { apiErrorMessage } from '@/lib/apiError'
import { GAMEDEP_SECTION } from '@/hooks/useSaveGameDep'
import type { GameDepType } from '@/hooks/useGameDepItem'

const GAMEDEP_NAME = /^[A-Za-z0-9._-]{1,128}$/

/** Create form state for a new game or dependency page. */
export function useCreateGameDep(type: GameDepType, slug: string) {
  const router = useRouter()
  const { tenantId } = useTenantId(slug)
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = name.trim()
    if (!GAMEDEP_NAME.test(id)) {
      setError('Name may use letters, digits, . _ - (max 128)')
      return Promise.resolve()
    }
    setSaving(true)
    setError('')
    return api
      .post(
        `/api/gamedep/${type}`,
        {
          name: id,
          displayName: displayName.trim() || id,
          description: description.trim(),
        },
        { params: tenantParams(tenantId) },
      )
      .then(() => router.push(`/site/${slug}/${GAMEDEP_SECTION[type]}/${id}`))
      .catch((err) => setError(apiErrorMessage(err, 'Could not create it')))
      .finally(() => setSaving(false))
  }

  return {
    name,
    setName,
    displayName,
    setDisplayName,
    description,
    setDescription,
    saving,
    error,
    submit,
  }
}
