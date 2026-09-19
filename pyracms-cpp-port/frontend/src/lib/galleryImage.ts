import { apiOrigin } from '@/lib/apiOrigin'

/** URL of an uploaded file, or '' when the item has none (no fakes). */
export function galleryFileUrl(uuid: unknown, thumb = false): string {
  if (typeof uuid !== 'string' || !uuid) return ''
  return (
    `${apiOrigin()}/api/files/${encodeURIComponent(uuid)}` +
    (thumb ? '/thumbnail' : '')
  )
}
