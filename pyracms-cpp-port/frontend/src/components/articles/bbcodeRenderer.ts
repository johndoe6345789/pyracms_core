import { sanitizeHtml } from '@/lib/sanitize'
import { safeHref, safeSrc } from '@/lib/safeUrl'

const attr = (v: string) => v.replace(/["'<>]/g, '')

export function renderBBCode(bbcode: string): string {
  let html = bbcode
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
  html = html.replace(
    /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
    (_m, u: string, t: string) =>
      `<a href="${attr(safeHref(u) ?? '#')}">${t}</a>`,
  )
  html = html.replace(
    /\[url\]([\s\S]*?)\[\/url\]/gi,
    (_m, u: string) => `<a href="${attr(safeHref(u) ?? '#')}">${attr(u)}</a>`,
  )
  html = html.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, (_m, u: string) => {
    const src = safeSrc(u)
    return src ? `<img src="${attr(src)}" style="max-width:100%" />` : ''
  })
  html = html.replace(
    /\[code\]([\s\S]*?)\[\/code\]/gi,
    '<pre style="' +
      'background:#1e293b;color:#e2e8f0;' +
      'padding:12px;border-radius:4px;' +
      'overflow:auto">' +
      '<code>$1</code></pre>',
  )
  html = html.replace(
    /\[quote\]([\s\S]*?)\[\/quote\]/gi,
    '<blockquote style="' +
      'border-left:3px solid #ccc;' +
      'padding-left:12px;margin:8px 0;' +
      'color:#666">$1</blockquote>',
  )
  html = html.replace(
    /\[list\]([\s\S]*?)\[\/list\]/gi,
    (_match, content: string) => {
      const items = content.split(/\[\*\]/).filter((s: string) => s.trim())
      return (
        '<ul>' +
        items.map((item: string) => `<li>${item.trim()}</li>`).join('') +
        '</ul>'
      )
    },
  )
  html = html.replace(
    /\[color=(#?[a-z0-9]{1,20})\]([\s\S]*?)\[\/color\]/gi,
    '<span style="color:$1">$2</span>',
  )
  html = html.replace(
    /\[size=(\d{1,3})\]([\s\S]*?)\[\/size\]/gi,
    '<span style="font-size:$1px">$2</span>',
  )
  html = html.replace(/\n/g, '<br />')
  return sanitizeHtml(html, true)
}
