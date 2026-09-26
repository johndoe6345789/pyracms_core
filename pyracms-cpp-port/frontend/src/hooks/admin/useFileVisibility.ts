'use client'

import api from '@/lib/api'
import type { FileItem, Visibility } from './fileData'
import { useActionError } from '../useActionError'

/** Switching a file between public and authenticated only. */
export function useFileVisibility(
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>,
) {
  const { error, setError, fail } = useActionError()

  const setVisibility = (file: FileItem, visibility: Visibility) => {
    setError('')
    api
      .put(`/api/files/${file.uuid}/visibility`, { visibility })
      .then(() =>
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, visibility } : f)),
        ),
      )
      .catch(fail(`Could not change who can open ${file.name}`))
  }

  return { setVisibility, visibilityError: error }
}
