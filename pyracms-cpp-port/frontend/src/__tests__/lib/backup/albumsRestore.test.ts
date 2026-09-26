import { m, noop } from '../../helpers/backupSetup'
import { albumsSection } from '@/lib/backup/albums'

const album = { id: 5, displayName: 'Trip' }
const photo = (id: number, uuid: string) => ({
  id,
  fileUuid: uuid,
  displayName: uuid,
  description: 'd',
})

function albumApi(state: { albums: object[]; pictures: object[] }) {
  m.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: url.includes('/albums/')
        ? {
            ...album,
            isPrivate: false,
            coverFileUuid: 'u1',
            pictures: state.pictures,
          }
        : state.albums,
    }),
  )
}

it('updates an album, adds photos, sets the cover', async () => {
  albumApi({ albums: [album], pictures: [photo(1, 'u1')] })
  const row = {
    displayName: 'Trip',
    description: '',
    isPrivate: false,
    sortOrder: 'title',
    coverMode: 'chosen',
    coverFileUuid: 'u1',
    pictures: [photo(1, 'u1'), photo(2, 'u2')],
  }
  const out = await albumsSection.restore([row], 1, noop)
  expect(out.updated).toBe(1)
  expect(m.put).toHaveBeenCalledWith(
    '/api/gallery/albums/5',
    expect.objectContaining({ sortOrder: 'title' }),
  )
  expect(m.post).toHaveBeenCalledTimes(1)
  expect(m.post.mock.calls[0][0]).toBe('/api/gallery/albums/5/pictures')
  expect(m.put).toHaveBeenCalledWith('/api/gallery/pictures/1/default', {})
})

it('creates a missing album and reports a failing one', async () => {
  const state = { albums: [] as object[], pictures: [] as object[] }
  albumApi(state)
  m.post.mockImplementationOnce(() => {
    state.albums.push(album)
    return Promise.resolve({ data: {} })
  })
  const row = {
    displayName: 'Trip',
    description: '',
    isPrivate: false,
    sortOrder: 'newest',
    coverMode: 'random',
    coverFileUuid: '',
    pictures: [],
  }
  expect((await albumsSection.restore([row], 1, noop)).created).toBe(1)
  m.put.mockRejectedValueOnce({ response: { data: { error: 'no' } } })
  const out = await albumsSection.restore([row], 1, noop)
  expect(out.failed).toEqual(['Trip: no'])
})

it('handles a non-list albums reply', async () => {
  m.get.mockResolvedValue({ data: {} })
  expect(await albumsSection.collect(1, noop)).toEqual([])
})
