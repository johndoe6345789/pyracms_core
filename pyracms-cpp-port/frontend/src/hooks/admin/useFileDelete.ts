'use client'

import { useState } from 'react'
import api from '@/lib/api'
import type { FileItem } from './fileData'
import { useActionError } from '../useActionError'

/** Confirm-then-delete flow for one file at a time. */
export function useFileDelete(
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>,
) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const del = useActionError()

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
    deleteDialogOpen,
    selectedFile,
    error: del.error,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
  }
}
