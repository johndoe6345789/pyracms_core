import { formatDay } from './articleDate'

export interface Article {
  id?: number
  title: string
  content: string
  author: string
  createdDate: string
  renderer: string
  views: number
  likes: number
  dislikes: number
  tags: string[]
  revisionCount: number
  /** draft | published | scheduled */
  status?: string
  isPrivate?: boolean
  scheduledAt?: string
}

/** Article as the API sends it; every field may be missing. */
interface RawArticle {
  id?: unknown
  name?: string
  displayName?: string
  content?: string
  authorUsername?: string
  createdAt?: string
  rendererName?: string
  viewCount?: number
  likes?: number
  dislikes?: number
  tags?: string[]
  revisionCount?: number
  status?: string
  isPrivate?: unknown
  scheduledAt?: unknown
}

export function mapArticle(a: RawArticle): Article {
  return {
    ...(typeof a.id === 'number' ? { id: a.id } : {}),
    title: a.displayName || a.name || '',
    content: a.content || '',
    author: a.authorUsername || 'Unknown',
    createdDate: formatDay(a.createdAt || ''),
    renderer: (a.rendererName || 'html').toLowerCase(),
    views: a.viewCount || 0,
    likes: a.likes || 0,
    dislikes: a.dislikes || 0,
    tags: a.tags || [],
    revisionCount: a.revisionCount || 0,
    status: a.status || 'published',
    isPrivate: Boolean(a.isPrivate),
    ...(a.scheduledAt ? { scheduledAt: String(a.scheduledAt) } : {}),
  }
}
