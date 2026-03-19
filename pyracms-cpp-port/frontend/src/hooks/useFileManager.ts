'use client'

import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'

export interface FileItem {
  id: number
  name: string
  size: number
  type: string
  downloads: number
  uploadedAt: string
  uuid: string
}

/**
 * Formats a byte count into a human-readable
 * string (B, KB, or MB).
 * @param bytes - The file size in bytes.
 * @returns A formatted size string.
 */
export function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/**
 * Maps a raw API file record to a FileItem.
 * @param f - Raw record from the API response.
 * @returns A typed FileItem object.
 */
function mapFileRecord(
  f: Record<string, unknown>
): FileItem {
  const createdAt =
    typeof f.createdAt === 'string'
      ? (f.createdAt as string).split('T')[0]
      : ''
  return {
    id: f.id as number,
    name: (f.filename as string) || '',
    size: (f.size as number) || 0,
    type: (f.mimetype as string) || '',
    downloads: (f.downloadCount as number) || 0,
    uploadedAt: createdAt,
    uuid: (f.uuid as string) || '',
  }
}

/**
 * Hook that manages file listing, upload,
 * deletion, and drag-and-drop state for the
 * file manager UI.
 * @param tenantId - The active tenant ID,
 *   or null if not yet loaded.
 * @returns State values and handler functions
 *   for file management.
 */
export function useFileManager(
  tenantId: number | null
) {
  const [files, setFiles] =
    useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false)
  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api
      .get(`/api/files?tenant_id=${tenantId}`)
      .then((res) => {
        const mapped = (res.data || []).map(
          mapFileRecord
        )
        setFiles(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  /**
   * Opens the delete confirmation dialog for
   * a specific file.
   * @param file - The file to potentially delete.
   */
  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  /**
   * Confirms deletion of the selected file
   * and removes it from state.
   */
  const handleDeleteConfirm = () => {
    if (selectedFile) {
      api
        .delete(`/api/files/${selectedFile.uuid}`)
        .then(() => {
          setFiles((prev) =>
            prev.filter(
              (f) => f.id !== selectedFile.id
            )
          )
        })
        .catch(() => {})
    }
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  /** Cancels the delete confirmation dialog. */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  /**
   * Uploads one or more files to the server.
   * @param fileList - Browser FileList from an
   *   input or drag event.
   */
  const uploadFiles = useCallback(
    (fileList: FileList) => {
      if (!tenantId) return
      Array.from(fileList).forEach((file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append(
          'tenant_id',
          String(tenantId)
        )
        api
          .post('/api/files', formData, {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          })
          .then((res) => {
            const f = res.data
            const today = new Date()
              .toISOString()
              .split('T')[0]
            setFiles((prev) => [
              ...prev,
              {
                id: f.id,
                name: f.filename || file.name,
                size: f.size || file.size,
                type: f.mimetype || file.type,
                downloads: 0,
                uploadedAt: today,
                uuid: f.uuid || '',
              },
            ])
          })
          .catch(() => {})
      })
    },
    [tenantId]
  )

  /** Handles dragover to enable drop zone style. */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(true)
    },
    []
  )

  /** Resets drag state when cursor leaves zone. */
  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  /**
   * Handles file drop and triggers upload for
   * all dropped files.
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  return {
    files,
    loading,
    deleteDialogOpen,
    selectedFile,
    dragOver,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadFiles,
  }
}
