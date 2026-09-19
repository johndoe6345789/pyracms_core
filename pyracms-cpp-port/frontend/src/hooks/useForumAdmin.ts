'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'
import { forumAdminRequest, type ForumDialog } from '@/lib/forumAdminApi'

/** Dialog state for forum/category admin actions; refreshes on success. */
export function useForumAdmin(
  tenantId: number | null, onDone: () => void,
) {
  const [dialog, setDialog] = useState<ForumDialog | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const open = (d: ForumDialog) => { setError(''); setDialog(d) }
  const close = () => setDialog(null)

  const submit = (name: string, description = '') => {
    if (!dialog || !tenantId) return Promise.resolve()
    setBusy(true)
    setError('')
    return forumAdminRequest(dialog, tenantId, name.trim(), description.trim())
      .then(() => { setDialog(null); onDone() })
      .catch((e) => setError(apiErrorMessage(e, 'Request failed')))
      .finally(() => setBusy(false))
  }

  return { dialog, busy, error, open, close, submit }
}

export type ForumAdminState = ReturnType<typeof useForumAdmin>
