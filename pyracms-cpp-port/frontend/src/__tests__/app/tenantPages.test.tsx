import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithStore } from '../helpers/renderWithStore'
import LoginPage from '@/app/auth/login/page'
import RegisterPage from '@/app/auth/register/page'
import TenantLayout from '@/app/site/[slug]/(tenant)/layout'
import SiteHomePage from '@/app/site/[slug]/(tenant)/page'
import GamesPage from '@/app/site/[slug]/(tenant)/games/page'
import GamePage from '@/app/site/[slug]/(tenant)/games/[name]/page'
import EditGamePage from '@/app/site/[slug]/(tenant)/games/[name]/edit/page'
import { useSaveGame } from '@/hooks/useSaveGame'
import { renderHook, act } from '@testing-library/react'
import api from '@/lib/api'

const push = jest.fn()
let search = new URLSearchParams('tenant=demo')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ slug: 'demo', name: 'g' }),
  usePathname: () => '/site/demo',
  useSearchParams: () => search,
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}))
jest.mock('@/components/launcher/GameLibrary', () => ({
  __esModule: true,
  default: (p: { slug: string; initialName?: string }) =>
    <div data-testid="lib">{p.slug}:{p.initialName ?? '-'}</div>,
}))
jest.mock('@/components/common/TenantBreadcrumbs', () => ({
  __esModule: true, default: () => <div data-testid="crumbs" />,
}))
let notFound = false
jest.mock('@/hooks/useTenant', () => ({
  titleFromSlug: (s: string) => s,
  useTenant: () => ({
    tenant: { displayName: 'Demo', description: '', ownerId: 1 },
    notFound,
  }),
}))

const put = api.put as jest.Mock

describe('auth pages', () => {
  it('render the forms', () => {
    const a = renderWithStore(<LoginPage />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    a.unmount()
    renderWithStore(<RegisterPage />)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })
})

describe('tenant pages', () => {
  beforeEach(() => { notFound = false; push.mockClear(); put.mockReset() })

  it('layout wraps children with chrome', () => {
    renderWithStore(<TenantLayout><p>kid</p></TenantLayout>)
    expect(screen.getByText('kid')).toBeInTheDocument()
    expect(screen.getByTestId('crumbs')).toBeInTheDocument()
    expect(screen.getByTestId('skip-to-content')).toBeInTheDocument()
  })

  it('home shows the welcome text and module cards', () => {
    renderWithStore(<SiteHomePage />)
    expect(screen.getByText(/Welcome to Demo/)).toBeInTheDocument()
    expect(screen.getByTestId('module-cards')).toBeInTheDocument()
  })

  it('home shows not found', () => {
    notFound = true
    renderWithStore(<SiteHomePage />)
    expect(screen.getByText(/no site called/)).toBeInTheDocument()
  })

  it('games pages pass the slug and name', () => {
    render(<GamesPage />)
    expect(screen.getByTestId('lib')).toHaveTextContent('demo:-')
    render(<GamePage />)
    expect(screen.getAllByTestId('lib')[1]).toHaveTextContent('demo:g')
  })

  it('edit page saves and navigates', async () => {
    put.mockResolvedValue({})
    render(<EditGamePage />)
    fireEvent.click(screen.getByText('Save Changes'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/site/demo/games/g'))
    expect(put.mock.calls[0][0]).toBe('/api/gamedep/game/item/g')
  })
})

describe('useSaveGame', () => {
  it('swallows failures and resets saving', async () => {
    push.mockClear()
    put.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useSaveGame('s', 'n'))
    await act(() => result.current.save(
      { displayName: 'a', description: 'b', tags: [] }))
    expect(result.current.saving).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })
})
