/** Module factory for jest.mock('@/hooks/useGalleryPicture'). */
export function galleryPictureMock() {
  return {
    useGalleryPicture: () => ({
      handleLike: jest.fn(),
      handleDislike: jest.fn(),
      handleSetCover: jest.fn().mockResolvedValue(undefined),
      refresh: jest.fn(),
      picture: {
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
      },
    }),
  }
}
