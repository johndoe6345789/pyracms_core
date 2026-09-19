import { formatForumDate } from '@/lib/forumDate'
import {
  mapReactions, type RawReaction, type Reaction,
} from '@/components/forum/reactionData'

export interface Post {
  id: string
  author: string
  date: string
  content: string
  likes: number
  dislikes: number
  isOwner: boolean
  authorId?: number
  reactions?: Reaction[]
}

export interface ThreadInfo {
  title: string
  description: string
  forumId: string
  forumName: string
  pinned: boolean
  locked: boolean
  views: number
}

export interface RawPost {
  id: number
  username?: string
  createdAt?: string
  content?: string
  likes?: number
  dislikes?: number
  userId?: number
  reactions?: RawReaction[]
}

export const EMPTY_THREAD: ThreadInfo = {
  title: '', description: '', forumId: '', forumName: '',
  pinned: false, locked: false, views: 0,
}

export function errMsg(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } }
  return e?.response?.data?.error || fallback
}

export function mapThread(d: Record<string, unknown>): ThreadInfo {
  return {
    title: String(d.name || ''),
    description: String(d.description || ''),
    forumId: String(d.forumId ?? ''),
    forumName: String(d.forumName || ''),
    pinned: Boolean(d.pinned),
    locked: Boolean(d.locked),
    views: Number(d.viewCount || 0),
  }
}

export function mapPosts(
  raw: RawPost[], userId: number | null, isModerator: boolean,
): Post[] {
  return raw.map((p) => ({
    id: String(p.id),
    author: p.username || 'Unknown',
    date: formatForumDate(p.createdAt),
    content: p.content || '',
    likes: p.likes || 0,
    dislikes: p.dislikes || 0,
    isOwner: isModerator || (userId !== null && p.userId === userId),
    ...(p.userId != null ? { authorId: p.userId } : {}),
    reactions: mapReactions(p.reactions),
  }))
}
