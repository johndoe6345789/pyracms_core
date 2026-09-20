import { esc, rstInline } from './rstInline'
import { at, indentedBlock, isBlank } from './rstText'

export const FIELD = /^:([^:\s][^:]*):\s*(.*)$/
export const TABLE = /^(\+[-=+]+\+|=+(\s+=+)+)\s*$/

export const pre = (lines: string[]) =>
  `<pre><code>${esc(lines.join('\n'))}</code></pre>`

/** Consecutive non-blank lines starting at `i`. */
export function paragraphLines(lines: string[], i: number) {
  const out: string[] = []
  while (i < lines.length && !isBlank(at(lines, i))) out.push(at(lines, i++))
  return { out, next: i }
}

/** `text::` introduces a literal block; `::` alone just introduces one. */
export function literalIntro(text: string) {
  if (!text.endsWith('::')) return null
  const head = text.slice(0, -2)
  return head.trim() === ''
    ? ''
    : head.endsWith(' ')
      ? head.trimEnd()
      : `${head}:`
}

export function fieldList(lines: string[], i: number) {
  const items: string[] = []
  while (FIELD.test(at(lines, i))) {
    const m = FIELD.exec(at(lines, i))
    const more = indentedBlock(lines, i + 1)
    const text = [m?.[2] ?? '', ...more.body].join(' ').trim()
    items.push(`<dt>${esc(m?.[1] ?? '')}</dt><dd>${rstInline(text)}</dd>`)
    i = more.next
    while (i < lines.length && isBlank(at(lines, i))) i++
  }
  return { html: `<dl>${items.join('')}</dl>`, next: i }
}
