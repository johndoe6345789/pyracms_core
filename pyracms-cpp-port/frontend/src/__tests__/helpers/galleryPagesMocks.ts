export const pic = {
  title: 'Pic',
  description: 'd',
  src: '/s',
  tags: [],
  likes: 1,
  dislikes: 0,
  isVideo: false,
  albumId: '4',
  albumName: 'Trip',
  ownerId: 1,
}

export const h = {
  picture: pic as unknown,
  handleLike: jest.fn(),
  handleDislike: jest.fn(),
  handleSetCover: jest.fn(),
  refresh: jest.fn(),
}

export const push = jest.fn()

export const navMock = {
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', albumId: '4', pictureId: '9' }),
}
export const tenantMock = { useTenantId: () => ({ tenantId: 1 }) }
export const manageMock = { useCanManage: () => true }
export const sessionMock = { useSiteSession: () => false }
export const albumsMock = {
  useGalleryAlbums: () => ({
    albums: [{ id: '1', name: 'A', coverImage: '/c', pictureCount: 2 }],
  }),
}
export const albumMock = {
  useGalleryAlbum: () => ({
    albumName: 'Trip',
    albumDescription: 'd',
    ownerId: 1,
    refresh: jest.fn(),
    pictures: [{ id: '1', title: 'P', src: '/p' }],
  }),
}
export const pictureMock = { useGalleryPicture: () => h }
export const tagsMock = {
  useTagCloudPage: () => ({ items: [] as unknown[], loading: false }),
}
