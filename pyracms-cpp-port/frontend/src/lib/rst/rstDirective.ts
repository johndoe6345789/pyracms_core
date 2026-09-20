import { safeSrc } from '../safeUrl'
import { esc } from './rstInline'

const NOTES = ['note', 'warning', 'tip', 'important', 'attention', 'caution']
const CODE = ['code-block', 'code', 'sourcecode', 'parsed-literal']

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Option lines (`:alt: text`) at the top of a directive body. */
function split(body: string[]) {
  const opts: Record<string, string> = {}
  let i = 0
  for (; i < body.length; i++) {
    const m = /^\s*:([\w-]+):\s*(.*)$/.exec(body[i] ?? '')
    if (!m) break
    opts[m[1] ?? ''] = m[2] ?? ''
  }
  return { opts, rest: body.slice(i).filter((l, j) => j > 0 || l.trim()) }
}

/**
 * One `.. name:: argument` directive as HTML. Unknown directives render
 * nothing: their source is not content.
 */
export function rstDirective(
  name: string,
  arg: string,
  body: string[],
  paragraphs: (lines: string[]) => string,
): string {
  const { opts, rest } = split(body)
  if (name === 'image' || name === 'figure') {
    const src = safeSrc(arg.trim())
    if (!src) return ''
    return `<img src="${esc(src)}" alt="${esc(opts.alt ?? '')}" style="max-width:100%">`
  }
  if (CODE.includes(name))
    return `<pre><code>${esc(rest.join('\n'))}</code></pre>`
  if (NOTES.includes(name)) {
    const head = `<p><strong>${cap(name)}</strong></p>`
    const lines = arg ? [arg, ...rest] : rest
    return `<div class="admonition ${name}">${head}${paragraphs(lines)}</div>`
  }
  return ''
}
