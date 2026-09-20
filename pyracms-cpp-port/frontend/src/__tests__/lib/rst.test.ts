import { renderRst, renderContentHtml } from '@/lib/renderContent'

describe('renderRst', () => {
  it('turns underlined titles into headings, by first-seen level', () => {
    const html = renderRst('Title\n=====\n\nSub\n---\n\nAnother\n=======\n')
    expect(html).toContain('<h2>Title</h2>')
    expect(html).toContain('<h3>Sub</h3>')
    expect(html).toContain('<h2>Another</h2>')
  })

  it('supports overlined titles', () => {
    expect(renderRst('=====\nTitle\n=====\n\ntext')).toContain('<h2>Title</h2>')
  })

  it('renders paragraphs with inline markup', () => {
    const html = renderRst('Some **bold**, *em* and ``code`` here.')
    expect(html).toBe(
      '<p>Some <strong>bold</strong>, <em>em</em> and <code>code</code> here.</p>',
    )
  })

  it('escapes raw HTML in the source', () => {
    const html = renderRst('a <script>alert(1)</script> b')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders links and drops unsafe ones', () => {
    expect(renderRst('see `Docs <https://x.io/a?b=1&c=2>`_')).toContain(
      '<a href="https://x.io/a?b=1&c=2">Docs</a>',
    )
    const bad = renderRst('`x <javascript:alert(1)>`_')
    expect(bad).not.toContain('href')
    expect(bad).toContain('x')
  })

  it('renders bullet, numbered and nested lists', () => {
    const html = renderRst('- one\n- two\n\n  - inner\n\n1. first\n2. second\n')
    expect(html).toContain('<ul><li>one</li><li><p>two</p>')
    expect(html).toContain('<ul><li>inner</li></ul></li></ul>')
    expect(html).toContain('<ol><li>first</li><li>second</li></ol>')
  })

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
