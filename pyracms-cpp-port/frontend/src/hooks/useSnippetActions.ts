'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

/** Fork and delete actions for a snippet, with a shared error. */
export function useSnippetActions(
  id: string, base: string, tenantId: number | null,
) {
  const router = useRouter()
  const [error, setError] = useState('')

  const fork = () => {
    api.post(`/api/snippets/${id}/fork`, { tenant_id: tenantId })
      .then((res) => router.push(`${base}/${res.data.id}`))
      .catch(() => setError('Log in to fork this snippet.'))
  }
  const remove = () => {
    api.delete(`/api/snippets/${id}`)
      .then(() => router.push(base))
      .catch(() => setError('Failed to delete snippet.'))
  }

  return { error, setError, fork, remove }
}
