export interface FileItem {
  id: number
  name: string
  size: number
  type: string
  downloads: number
  uploadedAt: string
  uuid: string
}

/** Formats a byte count as B, KB, or MB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/** Maps a raw API file record to a FileItem. */
export function mapFileRecord(f: Record<string, unknown>): FileItem {
  const createdAt =
    typeof f.createdAt === 'string'
      ? f.createdAt.split('T')[0] ?? ''
      : ''
  return {
    id: f.id as number,
    name: (f.filename as string) || '',
    size: (f.size as number) || 0,
    type: (f.mimetype as string) || '',
    downloads: (f.downloadCount as number) || 0,
    uploadedAt: createdAt,
    uuid: (f.uuid as string) || '',
  }
}

/** Builds a FileItem from an upload response and its File. */
export function fileFromUpload(
  f: Record<string, unknown>,
  file: File,
): FileItem {
  return {
    id: f.id as number,
    name: (f.filename as string) || file.name,
    size: (f.size as number) || file.size,
    type: (f.mimetype as string) || file.type,
    downloads: 0,
    uploadedAt: new Date().toISOString().split('T')[0] ?? '',
    uuid: (f.uuid as string) || '',
  }
}
