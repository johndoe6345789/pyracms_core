import api from '@/lib/api'

/** "a, b ,c" (the tag editor's text) as a clean list. */
export function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Replaces a snippet's tags (author only; the server normalises them). */
export async function putSnippetTags(id: string, tags: string[]) {
  await api.put(`/api/snippets/${id}/tags`, { tags })
}

/** What to tell the user when saving a snippet failed. */
export function saveErrorMessage(e: unknown): string {
  const status = (e as { response?: { status?: number } }).response?.status
  return status === 401
    ? 'Please log in to save snippets.'
    : 'Failed to save snippet.'
}
