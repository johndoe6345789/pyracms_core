import { renderRst, renderContentHtml } from '@/lib/renderContent'

describe('renderRst blocks', () => {
  it('renders literal blocks introduced by ::', () => {
    const html = renderRst('Run this::\n\n    a < b\n    c\n\nAfter.')
    expect(html).toContain('<p>Run this:</p>')
    expect(html).toContain('<pre><code>a &lt; b\nc</code></pre>')
    expect(html).toContain('<p>After.</p>')
  })

  it('renders code-block directives and notes', () => {
    const html = renderRst(
      '.. code-block:: python\n\n   print(1)\n\n.. note:: Careful\n',
    )
    expect(html).toContain('<pre><code>print(1)</code></pre>')
    expect(html).toContain('admonition note')
    expect(html).toContain('Careful')
  })

  it('renders images, refusing unsafe sources', () => {
    const ok = renderRst('.. image:: https://x.io/a.png\n   :alt: A badge\n')
    expect(ok).toContain('<img src="https://x.io/a.png" alt="A badge"')
    expect(renderRst('.. image:: javascript:alert(1)\n')).toBe('')
  })

  it('renders field lists and block quotes; comments vanish', () => {
    const html = renderRst(
      ':Author: Sam\n:Date: today\n\nIntro\n\n    quoted\n\n.. hidden\n',
    )
    expect(html).toContain('<dt>Author</dt><dd>Sam</dd>')
    expect(html).toContain('<blockquote><p>quoted</p></blockquote>')
    expect(html).not.toContain('hidden')
  })

  it('ignores unknown directives instead of showing their source', () => {
    expect(renderRst('.. toctree::\n\n   a\n   b\n')).toBe('')
  })

  it('handles CRLF and empty input', () => {
    expect(renderRst('a\r\n\r\nb')).toBe('<p>a</p>\n<p>b</p>')
    expect(renderRst('')).toBe('')
  })
})
describe('renderContentHtml', () => {
  it('picks the renderer from a label or an API name', () => {
    expect(renderContentHtml('**x**', 'RST')).toContain('<strong>x</strong>')
    expect(renderContentHtml('**x**', 'restructuredtext')).toContain(
      '<strong>x</strong>',
    )
    expect(renderContentHtml('[b]x[/b]', 'bbcode')).toContain(
      '<strong>x</strong>',
    )
    expect(renderContentHtml('<p>x</p>', 'html')).toBe('<p>x</p>')
  })
})
