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

/** A native HTML5 player. `:webm:` adds a second format for browsers that
 * cannot play the first; a plain download link is the last resort. */
function videoHtml(url: string, opts: Record<string, string>): string {
  const src = safeSrc(url)
  if (!src) return ''
  const poster = opts.poster ? safeSrc(opts.poster) : undefined
  const webm = opts.webm ? safeSrc(opts.webm) : undefined
  // Only a file name says what a URL holds; /view links are sniffed.
  const type = (u: string) =>
    /\.mp4(\?|$)/i.test(u)
      ? 'video/mp4'
      : /\.webm(\?|$)/i.test(u)
        ? 'video/webm'
        : ''
  const source = (u: string) => {
    const t = type(u)
    return `<source src="${esc(u)}"${t ? ` type="${t}"` : ''}>`
  }
  const inner = webm ? source(src) + source(webm) : ''
  return (
    `<video controls preload="metadata" playsinline` +
    `${webm ? '' : ` src="${esc(src)}"`}` +
    `${poster ? ` poster="${esc(poster)}"` : ''}>${inner}` +
    `Your browser cannot play this video. ` +
    `<a href="${esc(src)}">Download it</a></video>`
  )
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
    const alt = esc(opts.alt ?? '')
    return `<img src="${esc(src)}" alt="${alt}" style="max-width:100%">`
  }
  if (name === 'video') return videoHtml(arg.trim(), opts)
  if (CODE.includes(name))
    return `<pre><code>${esc(rest.join('\n'))}</code></pre>`
  if (NOTES.includes(name)) {
    const head = `<p><strong>${cap(name)}</strong></p>`
    const lines = arg ? [arg, ...rest] : rest
    return `<div class="admonition ${name}">${head}${paragraphs(lines)}</div>`
  }
  return ''
}
