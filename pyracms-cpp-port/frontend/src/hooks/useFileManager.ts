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

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function useFileManager(tenantId: number | null) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/files?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: FileItem[] = (res.data || []).map((f: Record<string, unknown>) => ({
          id: f.id,
          name: f.filename || '',
          size: f.size || 0,
          type: f.mimetype || '',
          downloads: f.downloadCount || 0,
          uploadedAt: typeof f.createdAt === 'string' ? (f.createdAt as string).split('T')[0] : '',
          uuid: f.uuid || '',
        }))
        setFiles(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedFile) {
      api.delete(`/api/files/${selectedFile.uuid}`)
        .then(() => {
          setFiles(prev => prev.filter(f => f.id !== selectedFile.id))
        })
        .catch(() => {})
    }
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedFile(null)
  }

  const uploadFiles = useCallback((fileList: FileList) => {
    if (!tenantId) return
    Array.from(fileList).forEach(file => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenant_id', String(tenantId))
      api.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => {
        const f = res.data
        setFiles(prev => [...prev, {
          id: f.id,
          name: f.filename || file.name,
          size: f.size || file.size,
          type: f.mimetype || file.type,
          downloads: 0,
          uploadedAt: new Date().toISOString().split('T')[0],
          uuid: f.uuid || '',
        }])
      }).catch(() => {})
    })
  }, [tenantId])

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
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [uploadFiles])

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
