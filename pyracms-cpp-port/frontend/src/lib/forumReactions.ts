import api from '@/lib/api'

/** Adds (PUT) or removes (DELETE) the caller's reaction on a post. */
export function setReaction(postId: string, key: string, add: boolean) {
  const base = `/api/forum/posts/${postId}/reactions`
  return add
    ? api.put(base, { emoji: key })
    : api.delete(`${base}/${encodeURIComponent(key)}`)
}
