import {
  RENDERER_LABELS,
  rendererFromApi,
  rendererToApi,
} from '@/lib/renderers'

describe('renderer names', () => {
  it('sends reStructuredText as restructuredtext', () => {
    expect(rendererToApi('reStructuredText')).toBe('restructuredtext')
    expect(rendererToApi('RST')).toBe('restructuredtext')
    expect(rendererToApi('rst')).toBe('restructuredtext')
  })

  it.each([
    ['HTML', 'html'],
    ['Markdown', 'markdown'],
    ['BBCode', 'bbcode'],
  ])('sends %s as %s', (label, api) => {
    expect(rendererToApi(label)).toBe(api)
  })

  it('maps API names back onto the editor labels', () => {
    expect(rendererFromApi('restructuredtext')).toBe('reStructuredText')
    expect(rendererFromApi('rst')).toBe('reStructuredText')
    expect(rendererFromApi('MARKDOWN')).toBe('Markdown')
  })

  it('round-trips every label', () => {
    for (const l of RENDERER_LABELS)
      expect(rendererFromApi(rendererToApi(l))).toBe(l)
  })

  it('keeps an unknown renderer readable', () => {
    expect(rendererFromApi('asciidoc')).toBe('Asciidoc')
  })
})
