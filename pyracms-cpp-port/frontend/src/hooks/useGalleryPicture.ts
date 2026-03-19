export interface PictureData {
  title: string
  description: string
  src: string
  tags: string[]
  likes: number
  dislikes: number
  isVideo: boolean
  albumId: string
  albumName: string
}

const PLACEHOLDER_PICTURE: PictureData = {
  title: 'Sunset Over the Mountains',
  description:
    'A breathtaking view of the sunset casting golden light over the mountain range. Captured during a hiking trip in the Alps.',
  src: 'https://picsum.photos/seed/fullview/1200/800',
  tags: ['landscape', 'sunset', 'mountains', 'nature', 'golden-hour'],
  likes: 42,
  dislikes: 3,
  isVideo: false,
  albumId: 'nature',
  albumName: 'Nature Photography',
}

export function useGalleryPicture(_pictureId: string) {
  const picture = PLACEHOLDER_PICTURE

  const handleLike = () => {
    // TODO: implement vote
  }

  const handleDislike = () => {
    // TODO: implement vote
  }

  return { picture, handleLike, handleDislike }
}
