export interface Comment {
  id: number
  user_id: number
  username: string
  avatar: string | null
  content: string
  parent_id: number | null
  upvotes: number
  downvotes: number
  user_vote: number | null
  created_at: string
  updated_at: string
  children: Comment[]
}

export interface CommentSectionProps {
  contentType: string
  contentId: number
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
