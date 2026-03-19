'use client'

import { useState, useCallback } from 'react'

export interface FileItem {
  id: number
  name: string
  size: number
  type: string
  downloads: number
  uploadedAt: string
}

const PLACEHOLDER_FILES: FileItem[] = [
  { id: 1, name: 'hero-banner.jpg', size: 245760, type: 'image/jpeg', downloads: 34, uploadedAt: '2025-05-01' },
  { id: 2, name: 'logo.png', size: 18432, type: 'image/png', downloads: 128, uploadedAt: '2025-04-15' },
  { id: 3, name: 'annual-report.pdf', size: 3145728, type: 'application/pdf', downloads: 56, uploadedAt: '2025-04-20' },
  { id: 4, name: 'styles-backup.css', size: 8192, type: 'text/css', downloads: 5, uploadedAt: '2025-05-10' },
  { id: 5, name: 'product-photo.jpg', size: 512000, type: 'image/jpeg', downloads: 22, uploadedAt: '2025-05-12' },
  { id: 6, name: 'readme.txt', size: 2048, type: 'text/plain', downloads: 12, uploadedAt: '2025-05-15' },
  { id: 7, name: 'avatar-default.png', size: 4096, type: 'image/png', downloads: 200, uploadedAt: '2025-03-01' },
  { id: 8, name: 'terms-of-service.pdf', size: 1048576, type: 'application/pdf', downloads: 88, uploadedAt: '2025-02-20' },
]

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function useFileManager() {
  const [files, setFiles] = useState<FileItem[]>(PLACEHOLDER_FILES)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedFile) {
      setFiles((prev) => prev.filter((f) => f.id !== selectedFile.id))
    }
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // TODO: Wire up actual file upload via RTK Query
  }, [])

  return {
    files,
    deleteDialogOpen,
    selectedFile,
    dragOver,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
