import type { RawReaction, Reaction } from '@/components/forum/reactionData'

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

export { EMPTY_THREAD, errMsg, mapThread, mapPosts } from './threadMappers'
