/** Result of a finished upload; same shape as POST /api/files. */
export type UploadResult = {
  success: boolean
  uuid: string
  filename: string
  size: number
  sha256: string
}

/** Options shared by the plain and chunked upload flows. */
export interface UploadOpts {
  tenantId?: number | null | undefined
  signal?: AbortSignal | undefined
  /** Called with bytes uploaded so far and the total size. */
  onProgress?: ((done: number, total: number) => void) | undefined
  /** Expected SHA-256 (hex); the upload fails if the server differs. */
  sha256?: string | undefined
  /** Base backoff delay in ms (default 500). */
  retryDelayMs?: number | undefined
}

/** Response of POST /api/files/uploads. */
/** Axios config fragment: only sets signal when one is given. */
export function sig(o: UploadOpts): { signal?: AbortSignal } {
  return o.signal ? { signal: o.signal } : {}
}

export interface UploadSession {
  uploadId: string
  partSize: number
  maxParts: number
}
