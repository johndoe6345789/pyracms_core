import { at, dedent, indentOf, isBlank } from './rstText'

const BULLET = /^(\s*)[-*+]\s+(.*)$/
const ENUM = /^(\s*)(?:\d+|[a-zA-Z]|#)[.)]\s+(.*)$/

function marker(line: string) {
  const b = BULLET.exec(line)
  if (b) return { kind: 'ul', indent: (b[1] ?? '').length, text: b[2] ?? '' }
  const e = ENUM.exec(line)
  if (e) return { kind: 'ol', indent: (e[1] ?? '').length, text: e[2] ?? '' }
  return null
}

export const startsList = (line: string) => marker(line) !== null

/** A single-paragraph item is shown without its <p>. */
const tight = (html: string) => {
  const m = /^<p>([\s\S]*)<\/p>$/.exec(html)
  return m && !html.includes('</p><') ? (m[1] ?? '') : html
}

/** Lines of one item after its marker line: deeper-indented or blank. */
function continuation(lines: string[], from: number, ind: number) {
  let i = from
  const rest: string[] = []
  while (i < lines.length) {
    let j = i
    while (j < lines.length && isBlank(at(lines, j))) j++
    if (j >= lines.length || indentOf(at(lines, j)) <= ind) break
    rest.push(...lines.slice(i, j + 1))
    i = j + 1
  }
  return { rest: dedent(rest), next: i }
}

/** A (possibly nested) list starting at `start`; `render` parses bodies. */
export function readList(
  lines: string[],
  start: number,
  render: (lines: string[]) => string,
) {
  const first = marker(at(lines, start))
  if (!first) return null
  const items: string[] = []
  let i = start
  for (;;) {
    const m = marker(at(lines, i))
    if (!m || m.indent !== first.indent || m.kind !== first.kind) break
    const cont = continuation(lines, i + 1, first.indent)
    items.push(`<li>${tight(render([m.text, ...cont.rest]))}</li>`)
    i = cont.next
    while (i < lines.length && isBlank(at(lines, i))) i++
  }
  return { html: `<${first.kind}>${items.join('')}</${first.kind}>`, next: i }
}
