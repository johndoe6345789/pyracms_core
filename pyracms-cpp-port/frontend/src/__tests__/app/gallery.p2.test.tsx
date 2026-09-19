import { render, screen } from '@testing-library/react'
import TagsPage from '@/app/site/[slug]/(tenant)/tags/page'
import SiteLayout from '@/app/site/[slug]/layout'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/site/s',
  useParams: () => ({ slug: 's', albumId: '4', pictureId: '9' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1 }),
}))
jest.mock('@/hooks/useGalleryAlbums', () => ({
  useGalleryAlbums: () => ({
    albums: [{ id: '1', name: 'A', coverImage: '/c', pictureCount: 2 }],
  }),
}))
jest.mock('@/hooks/useGalleryAlbum', () => ({
  useGalleryAlbum: () => ({
    albumName: 'Trip',
    pictures: [{ id: '1', title: 'P', src: '/p' }],
  }),
}))
const pic = {
  title: 'Pic',
  description: 'd',
  src: '/s',
  tags: [],
  likes: 1,
  dislikes: 0,
  isVideo: false,
  albumId: '4',
  albumName: 'Trip',
}
const h = {
  picture: pic as unknown,
  handleLike: jest.fn(),
  handleDislike: jest.fn(),
  handleSetCover: jest.fn(),
  handleDelete: jest.fn(),
}
jest.mock('@/hooks/useGalleryPicture', () => ({
  useGalleryPicture: () => h,
}))
let tags = { items: [] as unknown[], loading: false }
jest.mock('@/hooks/useTagCloudPage', () => ({
  useTagCloudPage: () => tags,
}))

describe('tags page and site layout', () => {
  it('handles loading, empty and populated', () => {
    tags = { items: [], loading: true }
    const { rerender } = render(<TagsPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    tags = { items: [], loading: false }
    rerender(<TagsPage />)
    expect(screen.getByText('No tags yet.')).toBeInTheDocument()
    tags = {
      items: [{ name: 'a', count: 1, fontSize: 13, height: 32, href: '/x' }],
      loading: false,
    }
    rerender(<TagsPage />)
    expect(screen.getByTestId('tag-cloud-chip-a')).toBeInTheDocument()
  })

  it('SiteLayout passes children through', () => {
    render(
      <SiteLayout>
        <p>kid</p>
      </SiteLayout>,
    )
    expect(screen.getByText('kid')).toBeInTheDocument()
  })
})
