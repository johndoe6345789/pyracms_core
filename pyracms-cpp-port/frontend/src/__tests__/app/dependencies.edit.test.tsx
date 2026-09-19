import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EditDepPage from '@/app/site/[slug]/(tenant)/dependencies/[name]/edit/page'
import api from '@/lib/api'
import { depRow as row } from '../helpers/depsPage'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 's', name: 'sdl2' }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}))
jest.mock('@/hooks/useSiteSession', () => ({
  useSiteSession: () => true,
}))
const get = api.get as jest.Mock
const put = api.put as jest.Mock
beforeEach(() => {
  push.mockReset()
  put.mockReset()
  get.mockReset()
})

describe('dependency edit page', () => {
  it('saves page fields and tags, then returns to the detail', async () => {
    get.mockResolvedValue({ data: row })
    put.mockResolvedValue({})
    render(<EditDepPage />)
    expect(await screen.findByLabelText('Display Name')).toHaveValue('SDL2')
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'SDL3' },
    })
    fireEvent.change(screen.getByPlaceholderText('Add tag...'), {
      target: { value: 'Fast' },
    })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Save Changes'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/site/s/dependencies/sdl2'),
    )
    expect(put.mock.calls[0]).toEqual([
      '/api/gamedep/dep/sdl2',
      { displayName: 'SDL3', description: 'lib' },
    ])
    expect(put.mock.calls[1][1].tags).toEqual(['audio', 'fast'])
  })

  it('shows the API error and stays put when saving fails', async () => {
    get.mockResolvedValue({ data: row })
    put.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    render(<EditDepPage />)
    fireEvent.click(await screen.findByText('Save Changes'))
    expect(await screen.findByTestId('save-error')).toHaveTextContent(
      'Forbidden',
    )
    expect(push).not.toHaveBeenCalled()
  })
})
