'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { VideoDetail, Visibility } from '@/lib/videos'

export interface VideoEdit {
  title: string
  description: string
  visibility: Visibility
}

/** One video (GET counts a view) plus voting, editing and deleting. */
export function useVideo(videoId: string, tenantId: number | null) {
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [missing, setMissing] = useState(false)
  const url = `/api/videos/${videoId}?tenant_id=${tenantId}`
  const voteUrl = `/api/videos/${videoId}/vote?tenant_id=${tenantId}`

  useEffect(() => {
    if (!tenantId || !videoId) return
    setMissing(false)
    api
      .get(`/api/videos/${videoId}?tenant_id=${tenantId}`)
      .then((r) => setVideo(r.data as VideoDetail))
      .catch(() => setMissing(true))
  }, [videoId, tenantId])

  const vote = async (isLike: boolean) => {
    if (!video) return
    const active = video.myVote === (isLike ? 'like' : 'dislike')
    const res = active
      ? await api.delete(voteUrl)
      : await api.post(voteUrl, { isLike })
    const { likes, dislikes, myVote } = res.data
    setVideo((v) => v && { ...v, likes, dislikes, myVote: myVote ?? '' })
  }

  const update = async (edit: VideoEdit) => {
    await api.put(url, edit)
    setVideo((v) => v && { ...v, ...edit })
  }

  const remove = () => api.delete(url)

  return { video, missing, vote, update, remove }
}
