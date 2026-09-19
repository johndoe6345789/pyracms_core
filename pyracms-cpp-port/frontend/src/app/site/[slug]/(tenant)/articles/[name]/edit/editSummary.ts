import { RENDERERS } from '@/hooks/useArticleEditor'

export interface ArticleEditSnapshot {
  content: string
  renderer: string
  tagsInput: string
}

export function parseTagsInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function normTags(value: string) {
  return parseTagsInput(value)
    .map((tag) => tag.toLowerCase())
    .sort()
}

export function sameTags(left: string, right: string) {
  const a = normTags(left)
  const b = normTags(right)
  return a.length === b.length && a.every((t, i) => t === b[i])
}

export function buildRevisionSummary(
  original: ArticleEditSnapshot,
  current: ArticleEditSnapshot,
) {
  const changes: string[] = []
  if (current.content !== original.content) {
    changes.push('content')
  }
  if (current.renderer !== original.renderer) {
    changes.push('renderer')
  }
  if (!sameTags(current.tagsInput, original.tagsInput)) {
    changes.push('tags')
  }
  return changes.length ? `Updated ${changes.join(', ')}` : ''
}

/** Maps an API renderer name onto the editor's RENDERERS entry. */
export function matchRenderer(name: string) {
  const lower = name.toLowerCase()
  return (
    RENDERERS.find((r) => r.toLowerCase() === lower)
    ?? lower.charAt(0).toUpperCase() + lower.slice(1)
  )
}
