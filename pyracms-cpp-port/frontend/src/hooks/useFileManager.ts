'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { FileItem, formatFileSize, mapFileRecord } from './admin/fileData'
import { useFileUpload } from './admin/useFileUpload'
import { useFolders } from './admin/useFolders'
import { useActionError } from './useActionError'

export type { FileItem }
export { formatFileSize }

/**
 * Hook that manages file listing, upload, deletion, and
 * drag-and-drop state for the file manager UI.
 * @param tenantId - The active tenant ID, or null.
 * @returns State values and handlers for file management.
 */
export function useFileManager(tenantId: number | null) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [tick, setTick] = useState(0)
  const del = useActionError()
  const dirs = useFolders(tenantId, () => setTick((t) => t + 1))
  const upload = useFileUpload(tenantId, setFiles, dirs.folder)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(
        `/api/files?tenant_id=${tenantId}&limit=200` +
          `&folder=${encodeURIComponent(dirs.folder)}`,
      )
      .then((res) => setFiles((res.data || []).map(mapFileRecord)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId, dirs.folder, tick])

  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const handleDeleteConfirm = () => {
    const target = selectedFile
    handleDeleteCancel()
    if (!target) return
    del.setError('')
    api
      .delete(`/api/files/${target.uuid}`)
      .then(() => {
        setFiles((prev) => prev.filter((f) => f.id !== target.id))
      })
      .catch(del.fail(`Could not delete ${target.name}`))
  }

  return {
    files,
    loading,
    deleteDialogOpen,
    selectedFile,
    error: del.error || upload.uploadError || dirs.error,
    dirs,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    ...upload,
  }
}
