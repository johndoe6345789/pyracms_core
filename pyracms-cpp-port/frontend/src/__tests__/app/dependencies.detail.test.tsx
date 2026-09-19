import { render, screen, fireEvent } from '@testing-library/react'
import DepPage from '@/app/site/[slug]/(tenant)/dependencies/[name]/page'
import api from '@/lib/api'
import { depRow as row } from '../helpers/depsPage'

jest.mock('@/components/common/CommentSection',
  () => require('../helpers/commentMock').commentSectionMock())
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ slug: 's', name: 'sdl2' }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn(), put: jest.fn() },
}))
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => true,
}))
const get = api.get as jest.Mock
beforeEach(() => { get.mockReset() })

describe('dependency detail page', () => {
  it('loads the dependency and walks through the tabs', async () => {
    get.mockResolvedValue({ data: { ...row, id: 12 } })
    render(<DepPage />)
    expect(await screen.findByTestId('edit-button'))
      .toHaveAttribute('href', '/site/s/dependencies/sdl2/edit')
    expect(get).toHaveBeenCalledWith('/api/gamedep/dep/sdl2')
    expect(screen.getByTestId('comments-dependency-12')).toBeInTheDocument()
    expect(screen.getByText('2.28.5')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tab-binaries'))
    fireEvent.click(screen.getByTestId('tab-dependencies'))
    fireEvent.click(screen.getByTestId('tab-screenshots'))
  })
  it('reports a missing dependency', async () => {
    get.mockRejectedValue(new Error('404'))
    render(<DepPage />)
    expect(await screen.findByTestId('item-not-found')).toBeInTheDocument()
  })
})
