import { generateArticleMetadata, fetchArticleJsonLd } from '@/lib/metadata'

const fetchMock = jest.fn()
beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock as unknown as typeof fetch
})

const ok = (body: unknown) => ({ ok: true, json: async () => body })

describe('generateArticleMetadata', () => {
  it('maps open graph fields', async () => {
    fetchMock.mockResolvedValue(ok({
      'og:title': 'T', 'og:description': 'D', 'og:url': 'http://u',
      'article:published_time': 'P', 'article:author': 'A',
    }))
    const m = await generateArticleMetadata('s', 'n', 2)
    expect(fetchMock.mock.calls[0][0]).toContain('/n/opengraph?tenant_id=2')
    expect(m.title).toBe('T')
    expect(m.openGraph).toMatchObject({ url: 'http://u', authors: ['A'] })
  })
  it('falls back to defaults', async () => {
    fetchMock.mockResolvedValue(ok({}))
    const m = await generateArticleMetadata('s', 'n')
    expect(m.title).toBe('n')
    expect(m.description).toBe('')
    expect(m.openGraph).toMatchObject({
      url: 'http://localhost:3000/site/s/articles/n',
    })
  })
  it('returns empty on http error and name on throw', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await generateArticleMetadata('s', 'n')).toEqual({})
    fetchMock.mockRejectedValueOnce(new Error('x'))
    expect(await generateArticleMetadata('s', 'n')).toEqual({ title: 'n' })
  })
})

describe('fetchArticleJsonLd', () => {
  it('returns json, null on error, null on throw', async () => {
    fetchMock.mockResolvedValueOnce(ok({ a: 1 }))
    expect(await fetchArticleJsonLd('s', 'n')).toEqual({ a: 1 })
    expect(fetchMock.mock.calls[0][0]).toContain('/n/jsonld?tenant_id=1')
    fetchMock.mockResolvedValueOnce({ ok: false })
    expect(await fetchArticleJsonLd('s', 'n')).toBeNull()
    fetchMock.mockRejectedValueOnce(new Error('x'))
    expect(await fetchArticleJsonLd('s', 'n')).toBeNull()
  })
})
