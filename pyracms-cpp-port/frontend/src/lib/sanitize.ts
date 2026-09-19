import DOMPurify from 'dompurify'

let hooked = false

function install() {
  if (hooked) return
  hooked = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer nofollow ugc')
    }
  })
}

const FORBID_ATTR = ['formaction', 'srcdoc']
const FORBID_TAGS = ['style', 'form', 'input', 'button', 'textarea',
  'select', 'iframe', 'object', 'embed', 'base', 'meta', 'link']

/**
 * Sanitises untrusted HTML for dangerouslySetInnerHTML. Without a DOM
 * (server render) nothing can be verified, so an empty string is returned
 * rather than DOMPurify's pass-through of the raw input.
 */
export function sanitizeHtml(html: string, allowStyle = false): string {
  if (typeof html !== 'string' || !DOMPurify.isSupported) return ''
  install()
  return DOMPurify.sanitize(html, {
    FORBID_TAGS,
    FORBID_ATTR: allowStyle ? FORBID_ATTR : [...FORBID_ATTR, 'style'],
    ADD_ATTR: ['target'],
    USE_PROFILES: { html: true },
  }) as string
}
