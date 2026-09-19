import { useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'

export function useRevisionDialogs(
  articleName?: string,
  tenantId?: number | null,
  onRevert?: (n: number) => Promise<void>
) {
  const [dlgOpen, setDlgOpen] = useState(false)
  const [content, setContent] = useState('')
  const [viewRev, setViewRev] = useState<Revision | null>(null)
  const [revertNum, setRevertNum] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleView = (rev: Revision) => {
    if (!articleName || !tenantId) return
    const url = `/api/articles/${articleName}`
      + `/revisions/${rev.number}?tenant_id=${tenantId}`
    setError('')
    api.get(url).then((res) => {
      setContent(sanitizeHtml(res.data.content || ''))
      setViewRev(rev)
      setDlgOpen(true)
    }).catch((e) => setError(
      apiErrorMessage(e, 'Could not load revision')))
  }

  const handleRevert = () => {
    if (revertNum === null || !onRevert) return
    setError('')
    onRevert(revertNum)
      .then(() => setRevertNum(null))
      .catch((e) => {
        setRevertNum(null)
        setError(apiErrorMessage(e, 'Could not revert revision'))
      })
  }

  return {
    dlgOpen,
    error,
    setDlgOpen,
    content,
    viewRev,
    revertNum,
    setRevertNum,
    handleView,
    handleRevert,
  }
}
