import { rstDirective } from './rstDirective'
import { readHeading } from './rstHeading'
import { esc, rstInline } from './rstInline'
import { readList, startsList } from './rstLists'
import { at, indentOf, indentedBlock, isBlank } from './rstText'

const FIELD = /^:([^:\s][^:]*):\s*(.*)$/
const TABLE = /^(\+[-=+]+\+|=+(\s+=+)+)\s*$/

const pre = (lines: string[]) =>
  `<pre><code>${esc(lines.join('\n'))}</code></pre>`

/** Consecutive non-blank lines starting at `i`. */
function paragraphLines(lines: string[], i: number) {
  const out: string[] = []
  while (i < lines.length && !isBlank(at(lines, i))) out.push(at(lines, i++))
  return { out, next: i }
}

/** `text::` introduces a literal block; `::` alone just introduces one. */
function literalIntro(text: string) {
  if (!text.endsWith('::')) return null
  const head = text.slice(0, -2)
  return head.trim() === ''
    ? ''
    : head.endsWith(' ')
      ? head.trimEnd()
      : `${head}:`
}

function fieldList(lines: string[], i: number) {
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

/** RST source lines -> HTML (block level). */
export function renderBlocks(lines: string[]): string {
  const out: string[] = []
  const styles: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = at(lines, i)
    if (isBlank(line)) {
      i++
      continue
    }
    const dir = /^\.\.\s+([\w-]+)::\s*(.*)$/.exec(line)
    if (dir || /^\.\.(\s|$)/.test(line)) {
      const blk = indentedBlock(lines, i + 1)
      if (dir)
        out.push(
          rstDirective(dir[1] ?? '', dir[2] ?? '', blk.body, renderBlocks),
        )
      i = blk.next
      continue
    }
    const step =
      readHeading(lines, i, styles) ??
      (startsList(line) ? readList(lines, i, renderBlocks) : null) ??
      (FIELD.test(line) ? fieldList(lines, i) : null)
    if (step) {
      out.push(step.html)
      i = step.next
      continue
    }
    if (TABLE.test(line)) {
      const t = paragraphLines(lines, i)
      out.push(pre(t.out))
      i = t.next
      continue
    }
    if (indentOf(line) > 0) {
      const q = indentedBlock(lines, i)
      out.push(`<blockquote>${renderBlocks(q.body)}</blockquote>`)
      i = q.next
      continue
    }
    const p = paragraphLines(lines, i)
    const text = p.out.map((l) => l.trim()).join('\n')
    const intro = literalIntro(text)
    i = p.next
    if (intro === null) {
      out.push(`<p>${rstInline(text)}</p>`)
      continue
    }
    if (intro) out.push(`<p>${rstInline(intro)}</p>`)
    const lit = indentedBlock(lines, i)
    if (lit.body.length) out.push(pre(lit.body))
    i = lit.body.length ? lit.next : i
  }
  return out.join('\n')
}
