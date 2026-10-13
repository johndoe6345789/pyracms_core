'use client'

import { useRef, useState } from 'react'
import { apiErrorMessage } from '@/lib/apiError'
import { captureVideoInfo, type VideoInfo } from '@/lib/videoFrame'
import { publishVideo } from '@/lib/videoPublish'
import type { Visibility } from '@/lib/videos'

const NO_INFO: VideoInfo = { duration: 0, frame: null }
const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || name
export const VIDEO_ACCEPT = 'video/mp4,video/webm'
const isPlayable = (f: File) =>
  VIDEO_ACCEPT.split(',').includes(f.type) || /\.(mp4|webm)$/i.test(f.name)

/** Upload form state: pick a file, fill in the details, publish. */
export function useVideoUpload(
  tenantId: number | null,
  onDone: (id: number) => void,
) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const info = useRef<Promise<VideoInfo>>(Promise.resolve(NO_INFO))

  const pick = (f: File | null | undefined) => {
    if (!f) return
    if (!isPlayable(f)) return setError('Choose an MP4 or WebM video')
    setFile(f)
    setError('')
    if (!title.trim()) setTitle(baseName(f.name).slice(0, 200))
    info.current = captureVideoInfo(f).catch(() => NO_INFO)
  }

  const submit = async () => {
    if (!file || !tenantId || !title.trim() || busy) return
    setBusy(true)
    setError('')
    setProgress(0)
    try {
      const fields = { title, description, visibility }
      const meta = await info.current
      onDone(await publishVideo(file, meta, fields, tenantId, setProgress))
    } catch (e) {
      setError(apiErrorMessage(e, 'Upload failed'))
      setProgress(null)
    } finally {
      setBusy(false)
    }
  }

  return {
    file,
    title,
    setTitle,
    description,
    setDescription,
    visibility,
    setVisibility,
    progress,
    busy,
    error,
    pick,
    submit,
  }
}

export type VideoUploadState = ReturnType<typeof useVideoUpload>
