import { at, isBlank } from './rstText'
import { rstInline } from './rstInline'

const ADORN = /^([=\-`:'"~^_*+#<>.])\1{2,}\s*$/

const isAdorn = (s: string) => ADORN.test(s)

/**
 * A section title at `i`: text with an underline, or between an overline
 * and an underline. The first adornment style met is the top level.
 * Levels start at h2: the article title is the page's h1.
 */
export function readHeading(lines: string[], i: number, styles: string[]) {
  const line = at(lines, i)
  let key = ''
  let text = ''
  let used = 0
  if (
    isAdorn(line) &&
    isAdorn(at(lines, i + 2)) &&
    !isBlank(at(lines, i + 1))
  ) {
    key = `o${line.trim().charAt(0)}`
    text = at(lines, i + 1).trim()
    used = 3
  } else if (!isBlank(line) && !isAdorn(line) && isAdorn(at(lines, i + 1))) {
    key = `u${at(lines, i + 1)
      .trim()
      .charAt(0)}`
    text = line.trim()
    used = 2
  }
  if (!used) return null
  if (!styles.includes(key)) styles.push(key)
  const level = Math.min(styles.indexOf(key) + 2, 6)
  return { html: `<h${level}>${rstInline(text)}</h${level}>`, next: i + used }
}
