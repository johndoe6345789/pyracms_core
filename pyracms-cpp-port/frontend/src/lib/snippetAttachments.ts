export interface SnippetAttachment {
  id: number
  fileUuid: string
  filename: string
  mimetype: string
  size: number
}

export function mapAttachment(a: Record<string, unknown>): SnippetAttachment {
  return {
    id: Number(a.id ?? 0),
    fileUuid: String(a.fileUuid ?? ''),
    filename: String(a.filename ?? 'file'),
    mimetype: String(a.mimetype ?? ''),
    size: Number(a.size ?? 0),
  }
}
