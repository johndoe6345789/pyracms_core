'use client'

import { useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'
import type { VideoDetail } from '@/lib/videos'
import type { VideoEdit } from '@/hooks/useVideo'

const EMPTY: VideoEdit = { title: '', description: '', visibility: 'public' }

/** Edit and delete dialogs of the watch page. */
export function useVideoManage(
  video: VideoDetail | null,
  update: (edit: VideoEdit) => Promise<void>,
  remove: () => Promise<unknown>,
  onDeleted: () => void,
) {
  const [dialog, setDialog] = useState<'' | 'edit' | 'delete'>('')
  const [form, setForm] = useState<VideoEdit>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const open = (which: 'edit' | 'delete') => {
    setError('')
    if (video) {
      const { title, description, visibility } = video
      setForm({ title, description, visibility })
    }
    setDialog(which)
  }

  const run = async (task: () => Promise<unknown>, label: string) => {
    setBusy(true)
    setError('')
    try {
      await task()
      return true
    } catch (e) {
      setError(apiErrorMessage(e, label))
      return false
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (await run(() => update(form), 'Could not save the video')) setDialog('')
  }

  const confirmDelete = async () => {
    if (await run(remove, 'Could not delete the video')) onDeleted()
  }

  const set = (patch: Partial<VideoEdit>) =>
    setForm((f) => ({ ...f, ...patch }))

  return {
    dialog,
    form,
    set,
    busy,
    error,
    open,
    close: () => setDialog(''),
    save,
    confirmDelete,
  }
}

export type VideoManageState = ReturnType<typeof useVideoManage>
