import { render, screen, waitFor } from '@testing-library/react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'
import { useDashboardStats } from '@/components/dashboard/useDashboardStats'
import { renderHook } from '@testing-library/react'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true, default: { get: jest.fn() },
}))
const get = api.get as jest.Mock
beforeEach(() => get.mockReset())

describe('useDashboardStats', () => {
  it('counts users, articles, tenants and settings', async () => {
    get.mockImplementation((u: string) => Promise.resolve({
      data: u === '/api/tenants' ? [{ id: 4 }, { id: 5 }]
        : u.startsWith('/api/users') ? [1, 2, 3] : [1] }))
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current[0]!.value).toBe('...')
    await waitFor(() => expect(result.current[0]!.value).toBe('3'))
    expect(result.current.map((s) => s.value)).toEqual(['3', '1', '2', '1'])
  })

  it('falls back to zero on errors and missing tenants', async () => {
    get.mockRejectedValue(new Error('x'))
    const { result } = renderHook(() => useDashboardStats())
    await waitFor(() => expect(result.current[0]!.value).toBe('0'))
    expect(result.current.map((s) => s.value)).toEqual(['0', '0', '0', '0'])
  })

  it('treats null payloads as empty', async () => {
    get.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useDashboardStats())
    await waitFor(() => expect(result.current[2]!.value).toBe('0'))
  })
})

describe('dashboard components', () => {
  it('DashboardStats renders one card per stat', async () => {
    get.mockResolvedValue({ data: [] })
    render(<DashboardStats />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('...')).toBeNull())
  })

  it('QuickActions lists the shortcuts', () => {
    render(<QuickActions />)
    expect(screen.getByText('Manage Users')).toBeInTheDocument()
  })
})
