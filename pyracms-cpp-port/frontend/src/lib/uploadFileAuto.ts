import api from '@/lib/api'
import { chunkedUpload } from './chunkedUpload'
import { sig } from './chunkedTypes'
import type { UploadOpts, UploadResult } from './chunkedTypes'

export const CHUNK_THRESHOLD = 40 * 1024 * 1024

/** Plain multipart upload for small files, chunked flow for big ones. */
export async function uploadFileAuto(
  file: File,
  opts: UploadOpts = {},
): Promise<UploadResult> {
  if (file.size >= CHUNK_THRESHOLD) return chunkedUpload(file, opts)
  const form = new FormData()
  form.append('file', file)
  if (opts.tenantId) form.append('tenant_id', String(opts.tenantId))
  const res = await api.post('/api/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...sig(opts),
    onUploadProgress: (e) => opts.onProgress?.(e.loaded, file.size),
  })
  return res.data as UploadResult
}
