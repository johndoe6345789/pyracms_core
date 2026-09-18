import CodePage from '@/app/site/[slug]/(tenant)/code/page'
import AlbumPage from '@/app/site/[slug]/(tenant)/code/[albumId]/page'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

it('redirects /code to snippets', async () => {
  await CodePage({ params: Promise.resolve({ slug: 's' }) })
  expect(redirect).toHaveBeenCalledWith('/site/s/snippets')
})

it('redirects legacy albums to snippets', async () => {
  await AlbumPage({ params: Promise.resolve({ slug: 's', albumId: '1' }) })
  expect(redirect).toHaveBeenLastCalledWith('/site/s/snippets')
})
