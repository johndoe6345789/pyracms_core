'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  FileItem, formatFileSize, mapFileRecord,
} from './admin/fileData'
import { useFileUpload } from './admin/useFileUpload'

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
  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null)
  const upload = useFileUpload(tenantId, setFiles)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(`/api/files?tenant_id=${tenantId}`)
      .then((res) => setFiles((res.data || []).map(mapFileRecord)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

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
    api
      .delete(`/api/files/${target.uuid}`)
      .then(() => {
        setFiles((prev) => prev.filter((f) => f.id !== target.id))
      })
      .catch(() => {})
  }

  return {
    files, loading, deleteDialogOpen, selectedFile,
    handleDeleteClick, handleDeleteConfirm, handleDeleteCancel,
    ...upload,
  }
}
