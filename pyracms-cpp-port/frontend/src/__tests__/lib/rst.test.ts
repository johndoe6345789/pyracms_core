import { renderRst } from '@/lib/renderContent'

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
      '<p>Some <strong>bold</strong>, <em>em</em> and ' +
        '<code>code</code> here.</p>',
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
})
