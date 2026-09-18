import { useState } from 'react'
import DOMPurify from 'dompurify'
import type { Revision } from '@/hooks/useRevisions'
import api from '@/lib/api'

export function useRevisionDialogs(
  articleName?: string,
  tenantId?: number | null,
  onRevert?: (n: number) => Promise<void>
) {
  const [dlgOpen, setDlgOpen] = useState(false)
  const [content, setContent] = useState('')
  const [viewRev, setViewRev] = useState<Revision | null>(null)
  const [revertNum, setRevertNum] = useState<number | null>(null)

  const handleView = (rev: Revision) => {
    if (!articleName || !tenantId) return
    const url = `/api/articles/${articleName}`
      + `/revisions/${rev.number}?tenant_id=${tenantId}`
    api.get(url).then((res) => {
      setContent(DOMPurify.sanitize(res.data.content || ''))
      setViewRev(rev)
      setDlgOpen(true)
    }).catch(() => {})
  }

  const handleRevert = () => {
    if (revertNum === null || !onRevert) return
    onRevert(revertNum)
      .then(() => setRevertNum(null))
      .catch(() => {})
  }

  return {
    dlgOpen,
    setDlgOpen,
    content,
    viewRev,
    revertNum,
    setRevertNum,
    handleView,
    handleRevert,
  }
}
