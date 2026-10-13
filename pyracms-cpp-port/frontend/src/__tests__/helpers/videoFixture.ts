import type { VideoDetail } from '@/lib/videos'

/** A public video row as the API returns it. */
export const makeVideo = (over: Partial<VideoDetail> = {}): VideoDetail => ({
  id: 7,
  tenantId: 1,
  userId: 2,
  username: 'bob',
  title: 'Cat video',
  description: 'A cat',
  fileUuid: 'f-1',
  thumbnailUuid: 't-1',
  durationSeconds: 75,
  viewCount: 1234,
  likes: 3,
  dislikes: 1,
  visibility: 'public',
  createdAt: '2026-09-20T10:00:00Z',
  myVote: '',
  ...over,
})
