import '../../helpers/adminShellMocks'
import { render, screen, waitFor } from '@testing-library/react'
import AdminRedirectPage from '@/app/admin/page'
import { m } from '../../helpers/scopeApi'
import { replace } from '../../helpers/scopeMocks'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)

jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/scopeMocks').navMock,
)

jest.mock('@/hooks/useAdminGate', () => ({
  useAdminGate: () => ({ slug: 's', allowed: true, checking: false }),
}))

jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 3, loading: false }),
}))

beforeEach(() => jest.resetAllMocks())

it('redirect page goes to the first tenant', async () => {
  m.get.mockResolvedValue({ data: [{ slug: 'first' }] })
  render(<AdminRedirectPage />)
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/site/first/admin'))
})

it('redirect page reports empty and failing loads', async () => {
  m.get.mockResolvedValueOnce({ data: null })
  const { unmount } = render(<AdminRedirectPage />)
  await screen.findByText(/No tenants found/)
  unmount()
  m.get.mockRejectedValueOnce(new Error('x'))
  render(<AdminRedirectPage />)
  await screen.findByText('Failed to load tenants')
})
