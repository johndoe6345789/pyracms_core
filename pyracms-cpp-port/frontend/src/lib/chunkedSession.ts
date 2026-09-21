import type { UploadSession } from './chunkedTypes'

export const MAX_PART_SIZE = 512 * 1024 * 1024

/** Rejects a server-provided session that cannot carry the file. */
export function validateSession(
  s: Partial<UploadSession> | undefined,
  fileSize: number,
): UploadSession {
  const { uploadId, partSize, maxParts } = s ?? {}
  const ok =
    typeof uploadId === 'string' &&
    uploadId !== '' &&
    Number.isInteger(partSize) &&
    Number.isInteger(maxParts) &&
    (partSize as number) > 0 &&
    (partSize as number) <= MAX_PART_SIZE &&
    (maxParts as number) > 0
  if (!ok) throw new Error('Server sent an invalid upload session')
  if (Math.ceil(fileSize / (partSize as number)) > (maxParts as number)) {
    throw new Error('File is too large for the server upload limits')
  }
  return s as UploadSession
}
