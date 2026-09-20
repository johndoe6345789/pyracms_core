/** Line helpers shared by the RST block parsers. */

export const at = (lines: string[], i: number): string => lines[i] ?? ''

export const indentOf = (s: string): number => s.length - s.trimStart().length

export const isBlank = (s: string): boolean => s.trim() === ''

/** Removes the smallest common indentation from non-blank lines. */
export function dedent(lines: string[]): string[] {
  const inds = lines.filter((l) => !isBlank(l)).map(indentOf)
  const cut = inds.length ? Math.min(...inds) : 0
  return lines.map((l) => (isBlank(l) ? '' : l.slice(cut)))
}

/**
 * The indented block starting at `from` (blank or indented lines), and
 * where parsing continues afterwards.
 */
export function indentedBlock(lines: string[], from: number) {
  let i = from
  const body: string[] = []
  while (
    i < lines.length &&
    (isBlank(at(lines, i)) || indentOf(at(lines, i)) > 0)
  )
    body.push(at(lines, i++))
  while (body.length && isBlank(body[body.length - 1] ?? '')) body.pop()
  while (body.length && isBlank(body[0] ?? '')) body.shift()
  return { body: dedent(body), next: i }
}
