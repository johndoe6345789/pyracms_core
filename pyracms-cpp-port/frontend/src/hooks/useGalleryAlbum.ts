export interface GalleryPicture {
  id: string
  title: string
  src: string
  cols: number
  rows: number
}

export function useGalleryAlbum(albumId: string) {
  const albumName = albumId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const pictures: GalleryPicture[] = Array.from({ length: 12 }, (_, i) => ({
    id: `pic-${i + 1}`,
    title: `Photo ${i + 1}`,
    src: `https://picsum.photos/seed/pic${i + 1}/400/300`,
    cols: i % 5 === 0 ? 2 : 1,
    rows: i % 7 === 0 ? 2 : 1,
  }))

  return { albumName, pictures }
}
