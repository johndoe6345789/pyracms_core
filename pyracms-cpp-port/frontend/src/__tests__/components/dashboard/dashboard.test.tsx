import { render, screen, waitFor } from '@testing-library/react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'
import { useDashboardStats } from '@/components/dashboard/useDashboardStats'
import { renderHook } from '@testing-library/react'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useDashboardStats', () => {
  it('counts users and articles and reads registration', async () => {
    get.mockImplementation((u: string) =>
      Promise.resolve({
        data: u.includes('registration_open')
          ? { value: 'false' }
          : u.startsWith('/api/users')
            ? [1, 2, 3]
            : [1],
      }),
    )
    const { result } = renderHook(() => useDashboardStats(4))
    expect(result.current[0]!.value).toBe('...')
    await waitFor(() => expect(result.current[0]!.value).toBe('3'))
    expect(result.current.map((s) => s.value)).toEqual(['3', '1', 'Closed'])
    expect(get).toHaveBeenCalledWith('/api/articles?tenant_id=4')
    expect(get).toHaveBeenCalledWith(
      '/api/settings/registration_open?tenant_id=4',
    )
  })

  it('shows an unavailable marker, not zero, on errors', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useDashboardStats(4))
    await waitFor(() => expect(result.current[0]!.value).toBe('N/A'))
    expect(result.current.map((s) => s.value)).toEqual(['N/A', 'N/A', 'Open'])
  })

  it('waits for the tenant before fetching', () => {
    renderHook(() => useDashboardStats(null))
    expect(get).not.toHaveBeenCalled()
  })

  it('treats null payloads as empty', async () => {
    get.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDashboardStats(4))
    await waitFor(() => expect(result.current[2]!.value).toBe('Open'))
    expect(result.current[0]!.value).toBe('0')
  })
})

describe('dashboard components', () => {
  it('DashboardStats renders one card per stat', async () => {
    get.mockResolvedValue({ data: [] })
    render(<DashboardStats tenantId={4} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Registration')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('...')).toBeNull())
  })

  it('QuickActions lists the shortcuts', () => {
    render(<QuickActions slug="s" />)
    expect(screen.getByTestId('quick-action-Manage Users')).toHaveAttribute(
      'href',
      '/site/s/admin/users',
    )
    expect(
      screen.getByTestId('quick-action-Create New Content'),
    ).toHaveAttribute('href', '/site/s/articles/create')
  })
})
