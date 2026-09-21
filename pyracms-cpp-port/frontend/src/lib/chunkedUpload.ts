import api from '@/lib/api'
import { withRetry } from './chunkedRetry'
import { validateSession } from './chunkedSession'
import { sig } from './chunkedTypes'
import type { UploadOpts, UploadResult } from './chunkedTypes'

export type { UploadOpts, UploadResult } from './chunkedTypes'

async function sendPart(
  base: string,
  n: number,
  body: Blob,
  opts: UploadOpts,
  done: number,
  total: number,
) {
  await withRetry(
    () =>
      api.put(`/api/files/uploads/${base}/parts/${n}`, body, {
        headers: { 'Content-Type': 'application/octet-stream' },
        ...sig(opts),
        onUploadProgress: (e) =>
          opts.onProgress?.(done + Math.min(e.loaded, body.size), total),
      }),
    opts.retryDelayMs,
    opts.signal,
  )
}

/** Uploads a file in sequential parts; aborts the server upload on error. */
export async function chunkedUpload(
  file: File,
  opts: UploadOpts = {},
): Promise<UploadResult> {
  const begin = await api.post(
    '/api/files/uploads',
    {
      filename: file.name,
      size: file.size,
      mimetype: file.type || undefined,
      sha256: opts.sha256,
      tenant_id: opts.tenantId ?? undefined,
    },
    sig(opts),
  )
  const { uploadId, partSize } = validateSession(begin.data, file.size)
  const id = encodeURIComponent(uploadId)
  try {
    const parts = Math.ceil(file.size / partSize)
    for (let n = 1; n <= parts; n++) {
      const start = (n - 1) * partSize
      const body = file.slice(start, start + partSize)
      await sendPart(id, n, body, opts, start, file.size)
      opts.onProgress?.(start + body.size, file.size)
    }
    const res = await api.post(
      `/api/files/uploads/${id}/complete`,
      {},
      sig(opts),
    )
    const out = res.data as UploadResult
    if (opts.sha256 && out.sha256 !== opts.sha256) {
      throw new Error('Upload checksum (sha256) mismatch')
    }
    return out
  } catch (err) {
    await api.delete(`/api/files/uploads/${id}`).catch(() => undefined)
    throw err
  }
}
