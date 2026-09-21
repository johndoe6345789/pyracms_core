'use client'

import { useState, useCallback } from 'react'
import { uploadFileAuto } from '@/lib/uploadFileAuto'
import { FileItem, fileFromUpload } from './fileData'
import { useActionError } from '../useActionError'

type SetFiles = React.Dispatch<React.SetStateAction<FileItem[]>>

/**
 * Upload and drag-and-drop state for the file manager.
 * @param tenantId - The active tenant ID, or null.
 * @param setFiles - State setter for the file list.
 */
export function useFileUpload(tenantId: number | null, setFiles: SetFiles) {
  const [dragOver, setDragOver] = useState(false)
  const { error: uploadError, setError, fail } = useActionError()

  const uploadFiles = useCallback(
    (fileList: FileList) => {
      if (!tenantId) return
      setError('')
      Array.from(fileList).forEach((file) => {
        uploadFileAuto(file, { tenantId })
          .then((res) => {
            const item = fileFromUpload(res, file)
            setFiles((prev) => [...prev, item])
          })
          .catch(fail(`Could not upload ${file.name}`))
      })
    },
    [tenantId, setFiles, setError, fail],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles],
  )

  return {
    dragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadFiles,
    uploadError,
  }
}
