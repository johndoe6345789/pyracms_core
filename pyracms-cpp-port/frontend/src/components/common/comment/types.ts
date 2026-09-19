export interface ApiComment {
  id: number
  userId: number
  username: string
  contentType: string
  contentId: number
  parentId: number | null
  body: string
  likes: number
  dislikes: number
  createdAt: string
  updatedAt: string
}

export interface Comment extends ApiComment {
  children: Comment[]
}

export interface CommentSectionProps {
  contentType: string
  contentId: number
}

/** Nest the backend's flat list by parentId (orphans become roots). */
export function buildTree(flat: ApiComment[]): Comment[] {
  const nodes = new Map<number, Comment>()
  flat.forEach((c) => nodes.set(c.id, { ...c, children: [] }))
  const roots: Comment[] = []
  nodes.forEach((n) => {
    const parent = n.parentId == null ? undefined : nodes.get(n.parentId)
    if (parent) parent.children.push(n)
    else roots.push(n)
  })
  return roots
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
