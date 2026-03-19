const PLACEHOLDER_ALBUMS = [
  {
    id: 'vacation-2024',
    name: 'Vacation 2024',
    coverImage: 'https://picsum.photos/seed/album1/400/300',
    pictureCount: 24,
  },
  {
    id: 'nature',
    name: 'Nature Photography',
    coverImage: 'https://picsum.photos/seed/album2/400/300',
    pictureCount: 48,
  },
  {
    id: 'portraits',
    name: 'Portraits',
    coverImage: 'https://picsum.photos/seed/album3/400/300',
    pictureCount: 12,
  },
  {
    id: 'architecture',
    name: 'Architecture',
    coverImage: 'https://picsum.photos/seed/album4/400/300',
    pictureCount: 36,
  },
  {
    id: 'street',
    name: 'Street Photography',
    coverImage: 'https://picsum.photos/seed/album5/400/300',
    pictureCount: 19,
  },
  {
    id: 'abstract',
    name: 'Abstract Art',
    coverImage: 'https://picsum.photos/seed/album6/400/300',
    pictureCount: 8,
  },
]

export interface GalleryAlbum {
  id: string
  name: string
  coverImage: string
  pictureCount: number
}

export function useGalleryAlbums() {
  const albums: GalleryAlbum[] = PLACEHOLDER_ALBUMS
  return { albums }
}
