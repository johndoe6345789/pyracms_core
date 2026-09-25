'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/lib/api'
import { withAncestors } from '@/lib/folderPath'
import { useActionError } from '../useActionError'

/**
 * The file manager's folders: which exist, which one is open, and making,
 * removing and filling them (GET/POST/DELETE /api/files/folders, and
 * PUT /api/files/{uuid}/folder to move a file).
 */
export function useFolders(tenantId: number | null, onMoved: () => void) {
  const [folders, setFolders] = useState<string[]>([])
  const [folder, setFolder] = useState('')
  const { error, setError, fail } = useActionError()
  const q = `tenant_id=${tenantId}`

  const reload = useCallback(() => {
    if (!tenantId) return
    api
      .get(`/api/files/folders?tenant_id=${tenantId}`)
      .then((res) => setFolders(withAncestors(res.data || [])))
      .catch(() => {})
  }, [tenantId])

  useEffect(reload, [reload])

  const create = (name: string) => {
    const path = [folder, name.trim()].filter(Boolean).join('/')
    setError('')
    api
      .post(`/api/files/folders?${q}`, { path })
      .then(reload)
      .catch(fail('Could not create the folder'))
  }

  const remove = (path: string) => {
    setError('')
    api
      .delete(`/api/files/folders?${q}&path=${encodeURIComponent(path)}`)
      .then(reload)
      .catch(fail('Could not remove the folder (it must be empty)'))
  }

  const move = (uuid: string, to: string) => {
    setError('')
    api
      .put(`/api/files/${uuid}/folder`, { folder: to })
      .then(() => {
        reload()
        onMoved()
      })
      .catch(fail('Could not move the file'))
  }

  return { folders, folder, setFolder, create, remove, move, error, reload }
}
