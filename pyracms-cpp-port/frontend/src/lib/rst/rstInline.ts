import { safeHref } from '../safeUrl'

export const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const attr = (v: string) => v.replace(/["'<>]/g, '')
const plain = (s: string) => s.replace(/&amp;/g, '&')

function link(label: string, url: string): string {
  const href = safeHref(plain(url).trim())
  return href ? `<a href="${attr(href)}">${label}</a>` : label
}

/** Inline markup of one paragraph: literals, links, strong, emphasis. */
export function rstInline(text: string): string {
  const lits: string[] = []
  let t = esc(text).replace(/``(.+?)``/g, (_m, c: string) => {
    lits.push(`<code>${c}</code>`)
    return `@@L${lits.length - 1}@@`
  })
  t = t.replace(
    /`([^`]+?)\s*&lt;(.+?)&gt;`_{1,2}/g,
    (_m, label: string, url: string) => link(label, url),
  )
  t = t.replace(/:[\w-]+:`([^`]+)`/g, '<code>$1</code>')
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[^*\w])\*(?![\s*])(.+?)\*(?![*\w])/g, '$1<em>$2</em>')
  t = t.replace(/`([^`]+)`(?!_)/g, '<em>$1</em>')
  return t.replace(/@@L(\d+)@@/g, (_m, i: string) => lits[+i] ?? '')
}
