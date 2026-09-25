import { apiOrigin } from '@/lib/apiOrigin'

/** URL of an uploaded file by uuid, or '' for none (no fakes). */
export function fileDownloadUrl(uuid: unknown): string {
  if (typeof uuid !== 'string' || !uuid) return ''
  return `${apiOrigin()}/api/files/${encodeURIComponent(uuid)}`
}

/** Where a file opens in the browser (pictures, PDF, text...) or ''. */
export function fileViewUrl(uuid: unknown): string {
  const url = fileDownloadUrl(uuid)
  return url ? `${url}/view` : ''
}
