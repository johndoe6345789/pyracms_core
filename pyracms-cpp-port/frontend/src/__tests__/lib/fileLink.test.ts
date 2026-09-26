import { fileLinkQuery, withLink } from '@/lib/fileLink'
import { m } from '../helpers/scopeApi'

jest.mock('@/lib/api', () => jest.requireActual('../helpers/apiMock').apiMock)

const soon = () => Math.floor(Date.now() / 1000) + 900

beforeEach(() => {
  jest.resetAllMocks()
})

it('asks for a link once and reuses it', async () => {
  const exp = soon()
  m.post.mockResolvedValue({ data: { query: `exp=${exp}&sig=aa`, exp } })
  expect(await fileLinkQuery('u-once')).toBe(`exp=${exp}&sig=aa`)
  expect(await fileLinkQuery('u-once')).toBe(`exp=${exp}&sig=aa`)
  expect(m.post).toHaveBeenCalledTimes(1)
  expect(m.post.mock.calls[0][0]).toBe('/api/files/u-once/link')
})

it('renews a link that is about to end', async () => {
  const old = Math.floor(Date.now() / 1000) + 10
  m.post
    .mockResolvedValueOnce({ data: { query: 'exp=1&sig=a', exp: old } })
    .mockResolvedValueOnce({ data: { query: 'exp=2&sig=b', exp: soon() } })
  await fileLinkQuery('u-renew')
  expect(await fileLinkQuery('u-renew')).toBe('exp=2&sig=b')
})

it('appends a link to a url', () => {
  expect(withLink('/api/files/u', 'exp=1&sig=a')).toBe(
    '/api/files/u?exp=1&sig=a',
  )
  expect(withLink('/api/files/u?x=1', 'exp=1')).toBe('/api/files/u?x=1&exp=1')
  expect(withLink('/api/files/u', '')).toBe('/api/files/u')
  expect(withLink('', 'exp=1')).toBe('')
})
