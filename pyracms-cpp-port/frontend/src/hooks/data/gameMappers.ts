import type { GameDepItem } from '@/hooks/useGameDepList'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import { dayOf } from '@/lib/dates'

const asStr = (v: unknown): string => (typeof v === 'string' ? v : '')
const day = dayOf

export function mapListItem(r: Record<string, unknown>): GameDepItem {
  return {
    name: asStr(r.name),
    displayName: asStr(r.displayName) || asStr(r.name),
    description: asStr(r.description),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    likes: Number(r.likes ?? 0),
    dislikes: Number(r.dislikes ?? 0),
    views: Number(r.viewCount ?? 0),
    created: day(r.createdAt),
  }
}

export function mapDetail(r: Record<string, unknown>): GameDepDetailData {
  const revs = Array.isArray(r.revisions) ? r.revisions : []
  const list = mapListItem(r)
  return {
    ...(typeof r.id === 'number' ? { id: r.id } : {}),
    name: list.name,
    displayName: list.displayName,
    description: list.description,
    owner: r.ownerId ? `user #${String(r.ownerId)}` : 'Unknown',
    created: list.created,
    views: list.views,
    likes: list.likes,
    dislikes: list.dislikes,
    tags: list.tags,
    revisions: revs.map((v: Record<string, unknown>) => ({
      version: asStr(v.version),
      published: Boolean(v.published),
      date: day(v.createdAt),
    })),
    binaries: [],
    dependencies: [],
    screenshots: [],
  }
}
