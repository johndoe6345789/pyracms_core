export type Visibility = 'public' | 'unlisted' | 'private'
export type VideoSort = 'newest' | 'popular'
export type MyVote = 'like' | 'dislike' | ''

export interface VideoSummary {
  id: number
  tenantId: number
  userId: number
  username: string
  title: string
  description: string
  fileUuid: string
  /** '' when the video has no thumbnail */
  thumbnailUuid: string
  durationSeconds: number
  viewCount: number
  likes: number
  dislikes: number
  visibility: Visibility
  createdAt: string
}

export interface VideoDetail extends VideoSummary {
  myVote: MyVote
}

export interface VideoQuery {
  userId?: number | undefined
  q?: string | undefined
  sort?: VideoSort | undefined
  limit?: number | undefined
}

export const PAGE_SIZE = 24

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: 'Public',
  unlisted: 'Unlisted',
  private: 'Private',
}

/** Query string of GET /api/videos. */
export function videoListParams(
  tenantId: number,
  query: VideoQuery,
  offset: number,
): string {
  const p = new URLSearchParams({ tenant_id: String(tenantId) })
  if (query.userId) p.set('user_id', String(query.userId))
  const q = query.q?.trim()
  if (q) p.set('q', q)
  if (query.sort) p.set('sort', query.sort)
  p.set('limit', String(query.limit ?? PAGE_SIZE))
  p.set('offset', String(offset))
  return p.toString()
}

export const videosHref = (slug: string) => `/site/${slug}/videos`
export const watchHref = (slug: string, id: number) =>
  `/site/${slug}/videos/watch/${id}`
export const channelHref = (slug: string, userId: number) =>
  `/site/${slug}/videos/channel/${userId}`
