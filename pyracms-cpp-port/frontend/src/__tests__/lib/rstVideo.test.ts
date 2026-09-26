import { renderRst } from '@/lib/renderContent'
import { sanitizeHtml } from '@/lib/sanitize'

describe('the video directive', () => {
  it('renders a native player with a download fallback', () => {
    const html = renderRst('.. video:: /api/files/abc/view\n')
    expect(html).toContain('<video controls preload="metadata" playsinline')
    expect(html).toContain('src="/api/files/abc/view"')
    expect(html).toContain('<a href="/api/files/abc/view">Download it</a>')
    expect(html).not.toContain('poster')
  })

  it('takes a poster image', () => {
    const html = renderRst(
      '.. video:: /api/files/v/view\n   :poster: /api/files/p/view\n',
    )
    expect(html).toContain('poster="/api/files/p/view"')
    expect(
      renderRst('.. video:: /a.mp4\n   :poster: javascript:x\n'),
    ).not.toContain('poster')
  })

  it('refuses unsafe sources and survives sanitising', () => {
    expect(renderRst('.. video:: javascript:alert(1)\n')).toBe('')
    const safe = sanitizeHtml(renderRst('.. video:: https://x.io/a.mp4\n'))
    expect(safe).toContain('<video')
    expect(safe).toContain('controls')
    expect(safe).toContain('src="https://x.io/a.mp4"')
  })
})
