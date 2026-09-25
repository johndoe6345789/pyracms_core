export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'code'
  | 'text'
  | 'data'
  | 'spreadsheet'
  | 'document'
  | 'presentation'
  | 'design'
  | 'font'
  | 'program'
  | 'package'
  | 'other'

const EXT: Record<FileKind, string[]> = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tif', 'tiff'],
  video: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'm4v'],
  audio: ['mp3', 'ogg', 'wav', 'flac', 'aac', 'm4a', 'mid', 'midi'],
  pdf: ['pdf'],
  archive: ['zip', '7z', 'rar', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'arj', 'iso'],
  code: [
    ...['py', 'c', 'h', 'cpp', 'hpp', 'cc', 'js', 'ts', 'tsx', 'jsx'],
    ...['java', 'go', 'rs', 'rb', 'php', 'cs', 'sh', 'bat', 'sql', 'css'],
    ...['html', 'htm', 'ps1', 'lua'],
  ],
  text: ['txt', 'md', 'rst', 'log', 'ini', 'cfg', 'toml', 'readme'],
  data: ['json', 'csv', 'xml', 'yml', 'yaml', 'db', 'sqlite'],
  spreadsheet: ['xls', 'xlsx', 'ods'],
  document: ['doc', 'docx', 'odt', 'rtf'],
  presentation: ['ppt', 'pptx', 'odp'],
  design: ['svg', 'dia', 'psd', 'ai', 'xcf', 'blend', 'dxf', 'stl'],
  font: ['ttf', 'otf', 'woff', 'woff2'],
  program: ['exe', 'dll', 'msi', 'so', 'bin', 'jar'],
  package: ['apk', 'deb', 'rpm', 'dmg', 'appimage'],
  other: [],
}

/** Extensions the server will open in the browser (see viewMime there). */
const VIEWABLE = new Set([
  ...EXT.image.filter((e) => ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)),
  ...['pdf', 'mp4', 'webm', 'mp3', 'ogg', 'wav', 'json'],
  ...['txt', 'md', 'rst', 'csv', 'log', 'py', 'c', 'h', 'cpp', 'hpp', 'cc'],
  ...['js', 'ts', 'tsx', 'jsx', 'css', 'xml', 'yml', 'yaml', 'sh', 'bat'],
  ...['ini', 'cfg', 'toml', 'sql', 'java', 'go', 'rs', 'rb'],
])

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase()
}

/** What sort of file this is: by extension first, then by content type. */
export function fileKind(name: string, mime = ''): FileKind {
  const ext = extensionOf(name)
  for (const [kind, list] of Object.entries(EXT))
    if (ext && list.includes(ext)) return kind as FileKind
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('text/')) return 'text'
  if (mime === 'application/zip') return 'archive'
  return 'other'
}

/** Can the browser show this instead of downloading it? */
export function canView(name: string): boolean {
  return VIEWABLE.has(extensionOf(name))
}
