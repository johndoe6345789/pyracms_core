import { apiOrigin } from '@/lib/apiOrigin'

/** URL of an uploaded file by uuid, or '' for none (no fakes). */
export function fileDownloadUrl(uuid: unknown): string {
  if (typeof uuid !== 'string' || !uuid) return ''
  return `${apiOrigin()}/api/files/${encodeURIComponent(uuid)}`
}
