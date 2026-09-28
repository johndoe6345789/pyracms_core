import api from '@/lib/api'
import { uploadFileAuto } from '@/lib/uploadFileAuto'
import type { VideoInfo } from '@/lib/videoFrame'
import type { Visibility } from '@/lib/videos'

export interface VideoFields {
  title: string
  description: string
  visibility: Visibility
}

/** Uploads the still as a PNG; '' when there is none or it fails. */
export async function uploadThumbnail(
  frame: Blob | null,
  tenantId: number,
): Promise<string> {
  if (!frame) return ''
  const file = new File([frame], 'thumbnail.png', { type: 'image/png' })
  try {
    return (await uploadFileAuto(file, { tenantId })).uuid || ''
  } catch {
    return ''
  }
}

/** Uploads the file and its still, then creates the video; returns its id. */
export async function publishVideo(
  file: File,
  info: VideoInfo,
  fields: VideoFields,
  tenantId: number,
  onProgress: (percent: number) => void,
): Promise<number> {
  const up = await uploadFileAuto(file, {
    tenantId,
    onProgress: (done, total) =>
      onProgress(total ? Math.round((done * 100) / total) : 0),
  })
  const thumbnailUuid = await uploadThumbnail(info.frame, tenantId)
  const res = await api.post('/api/videos', {
    tenantId,
    title: fields.title.trim(),
    description: fields.description,
    fileUuid: up.uuid,
    thumbnailUuid,
    durationSeconds: Math.round(info.duration),
    visibility: fields.visibility,
  })
  return Number(res.data.id)
}
