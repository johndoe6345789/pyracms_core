'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiError'
import type { AlbumOptions } from './useGalleryAlbum'

export interface AlbumDetails {
  name: string
  description: string
  isPrivate: boolean
  sortOrder: string
}

/**
 * Everything the album edit page changes: the album's details, how its cover
 * is picked, and each photo (edit, delete, make it the cover). Every action
 * calls `onDone` so the page reloads what the server now says.
 */
export function useAlbumEdit(albumId: string, onDone: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const run = async (call: () => Promise<unknown>, fail: string) => {
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await call()
      setSaved(true)
      onDone()
    } catch (e) {
      setError(apiErrorMessage(e, fail))
    } finally {
      setBusy(false)
    }
  }
  const album = `/api/gallery/albums/${albumId}`
  const body = (d: AlbumDetails) => ({
    displayName: d.name.trim(),
    description: d.description,
    isPrivate: d.isPrivate,
    sortOrder: d.sortOrder,
  })

  return {
    busy,
    error,
    saved,
    saveDetails: (d: AlbumDetails) =>
      run(() => api.put(album, body(d)), 'Could not save the album'),
    setCoverMode: (d: AlbumDetails, mode: AlbumOptions['coverMode']) =>
      run(
        () => api.put(album, { ...body(d), coverMode: mode }),
        'Could not change the cover',
      ),
    setCover: (pictureId: string) =>
      run(
        () => api.put(`/api/gallery/pictures/${pictureId}/default`, {}),
        'Could not set the cover',
      ),
    editPicture: (id: string, title: string, description: string) =>
      run(
        () =>
          api.put(`/api/gallery/pictures/${id}`, {
            displayName: title,
            description,
          }),
        'Could not save the photo',
      ),
    removePicture: (id: string) =>
      run(
        () => api.delete(`/api/gallery/pictures/${id}`),
        'Could not delete the photo',
      ),
  }
}
