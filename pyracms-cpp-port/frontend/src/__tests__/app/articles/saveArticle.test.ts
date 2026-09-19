import {
  saveArticle,
  PartialSaveError,
} from '@/app/site/[slug]/(tenant)/articles/[name]/edit/saveArticle'
import { m } from '../../helpers/scopeApi'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

const args = {
  name: 'n',
  tenantId: 1,
  content: 'c',
  summary: '',
  tags: ['a'],
  renderer: 'BBCode',
  origRenderer: 'HTML',
}
const boom = { response: { data: { error: 'boom' } } }

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
})

it('saves content, tags and renderer', async () => {
  await saveArticle(args)
  expect(m.put).toHaveBeenCalledTimes(3)
})

it('surfaces a tags failure', async () => {
  m.put.mockResolvedValueOnce({}).mockRejectedValueOnce(boom)
  const p = saveArticle(args)
  await expect(p).rejects.toBeInstanceOf(PartialSaveError)
  await expect(p).rejects.toThrow('tags failed: boom')
})

it('surfaces a renderer failure', async () => {
  m.put
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(boom)
  await expect(saveArticle(args)).rejects.toThrow('renderer failed: boom')
})
