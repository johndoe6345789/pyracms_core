import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DepsPage from '@/app/site/[slug]/(tenant)/dependencies/page'
import DepPage from '@/app/site/[slug]/(tenant)/dependencies/[name]/page'
import EditDepPage
  from '@/app/site/[slug]/(tenant)/dependencies/[name]/edit/page'
import api from '@/lib/api'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', name: 'sdl2' }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true, default: { put: jest.fn() },
}))
const put = api.put as jest.Mock
beforeEach(() => { push.mockReset(); put.mockReset() })

describe('dependencies list page', () => {
  it('filters the list through the search bar', () => {
    render(<DepsPage />)
    expect(screen.getByText('SDL2')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Search dependencies...'),
      { target: { value: 'zzzz-nothing' } })
    expect(screen.queryByText('SDL2')).toBeNull()
  })
})

describe('dependency detail page', () => {
  it('walks through every tab', () => {
    render(<DepPage />)
    expect(screen.getByTestId('edit-button'))
      .toHaveAttribute('href', '/site/s/dependencies/sdl2/edit')
    expect(screen.getByText('2.28.5')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tab-binaries'))
    expect(screen.getAllByText('Windows').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByTestId('tab-dependencies'))
    expect(screen.getByText('Math Library')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tab-screenshots'))
    expect(screen.getByAltText('Screenshot 1')).toBeInTheDocument()
  })
})

describe('dependency edit page', () => {
  it('saves and returns to the detail page', async () => {
    put.mockResolvedValue({})
    render(<EditDepPage />)
    fireEvent.change(screen.getByLabelText('Display Name'),
      { target: { value: 'SDL3' } })
    fireEvent.change(screen.getByPlaceholderText('Add tag...'),
      { target: { value: 'Fast' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Save Changes'))
    await waitFor(() => expect(push).toHaveBeenCalledWith(
      '/site/s/dependencies/sdl2'))
    expect(put.mock.calls[0][1]).toMatchObject({ displayName: 'SDL3' })
    expect(put.mock.calls[0][1].tags).toContain('fast')
  })

  it('stays put when saving fails', async () => {
    put.mockRejectedValue(new Error('x'))
    render(<EditDepPage />)
    fireEvent.click(screen.getByText('Save Changes'))
    await waitFor(() => expect(screen.getByText('Save Changes'))
      .not.toBeDisabled())
    expect(push).not.toHaveBeenCalled()
  })
})
