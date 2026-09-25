/** "a/b" -> "a"; a top-level folder's parent is "". */
export function parentOf(path: string): string {
  const cut = path.lastIndexOf('/')
  return cut < 0 ? '' : path.slice(0, cut)
}

/** The last segment of a folder path. */
export function baseName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/** Folders directly inside `folder` ("" = the top). */
export function childFolders(all: string[], folder: string): string[] {
  return all.filter((p) => parentOf(p) === folder)
}

/** Every folder on the way to `path`, for a breadcrumb: a, a/b, a/b/c. */
export function trail(path: string): string[] {
  const parts = path ? path.split('/') : []
  return parts.map((_, i) => parts.slice(0, i + 1).join('/'))
}

/** Folders that exist implicitly: a/b/c also means a and a/b are there. */
export function withAncestors(paths: string[]): string[] {
  return [...new Set(paths.flatMap(trail))].sort()
}
