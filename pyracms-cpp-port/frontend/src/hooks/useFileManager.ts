'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  FileItem,
  Visibility,
  formatFileSize,
  mapFileRecord,
} from './admin/fileData'
import { useFileUpload } from './admin/useFileUpload'
import { useFolders } from './admin/useFolders'
import { useFileVisibility } from './admin/useFileVisibility'
import { useFileDelete } from './admin/useFileDelete'

export type { FileItem, Visibility }
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
  const [tick, setTick] = useState(0)
  const dirs = useFolders(tenantId, () => setTick((t) => t + 1))
  const upload = useFileUpload(tenantId, setFiles, dirs.folder)
  const vis = useFileVisibility(setFiles)
  const del = useFileDelete(setFiles)

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

  return {
    files,
    loading,
    deleteDialogOpen: del.deleteDialogOpen,
    selectedFile: del.selectedFile,
    error: del.error || upload.uploadError || dirs.error || vis.visibilityError,
    setVisibility: vis.setVisibility,
    dirs,
    handleDeleteClick: del.handleDeleteClick,
    handleDeleteConfirm: del.handleDeleteConfirm,
    handleDeleteCancel: del.handleDeleteCancel,
    ...upload,
  }
}
