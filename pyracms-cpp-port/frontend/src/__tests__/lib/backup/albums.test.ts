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

it('backs up an album with its cover and photos', async () => {
  albumApi({ albums: [album], pictures: [photo(1, 'u1')] })
  const rows = await albumsSection.collect(1, noop)
  expect(rows[0]).toMatchObject({
    displayName: 'Trip',
    coverMode: 'chosen',
    sortOrder: 'newest',
    coverFileUuid: 'u1',
    pictures: [{ displayName: 'u1', description: 'd', fileUuid: 'u1' }],
  })
})
