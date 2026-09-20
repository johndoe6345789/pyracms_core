import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import AdminSettingsPage from '@/app/site/[slug]/(admin)/admin/settings/page'
import { m } from '../../helpers/scopeApi'
import { routeGet } from '../../helpers/scopeMocks'

jest.mock(
  '@/lib/api',
  () => jest.requireActual('../../helpers/apiMock').apiMock,
)
jest.mock(
  'next/navigation',
  () => jest.requireActual('../../helpers/scopeMocks').navMock,
)
jest.mock(
  '@/hooks/useTenantId',
  () => jest.requireActual('../../helpers/scopeMocks').tenantMock,
)

const field = (key: string) => screen.getByTestId(`setting-${key}`)
const toggle = (key: string) => within(field(key)).getByRole('checkbox')

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({})
})

it('loads stored values into the guided form', async () => {
  routeGet({
    '/api/settings': [
      { id: 1, name: 'site_name', value: 'My Site' },
      { id: 2, name: 'registration_open', value: 'false' },
    ],
  })
  render(<AdminSettingsPage />)
  await waitFor(() => expect(field('site_name')).toHaveValue('My Site'))
  expect(toggle('registration_open')).not.toBeChecked()
})

it('saves every guided setting through /api/settings', async () => {
  routeGet({ '/api/settings': [] })
  render(<AdminSettingsPage />)
  fireEvent.change(field('site_name'), { target: { value: ' Hi ' } })
  fireEvent.click(toggle('comments_enabled'))
  fireEvent.click(screen.getByTestId('save-site-settings-btn'))
  await screen.findByTestId('settings-saved')
  expect(m.put).toHaveBeenCalledTimes(10)
  expect(m.put).toHaveBeenCalledWith('/api/settings/site_name?tenant_id=1', {
    name: 'site_name',
    value: 'Hi',
    tenantId: 1,
  })
  expect(m.put).toHaveBeenCalledWith(
    '/api/settings/comments_enabled?tenant_id=1',
    { name: 'comments_enabled', value: 'false', tenantId: 1 },
  )
})
it('refuses to save invalid values and shows why', async () => {
  routeGet({ '/api/settings': [] })
  render(<AdminSettingsPage />)
  fireEvent.change(field('contact_email'), { target: { value: 'nope' } })
  fireEvent.click(screen.getByTestId('save-site-settings-btn'))
  await screen.findByText('Enter a valid email address.')
  expect(m.put).not.toHaveBeenCalled()
})

it('shows a save failure', async () => {
  routeGet({ '/api/settings': [] })
  m.put.mockRejectedValue({ response: { data: { error: 'nope' } } })
  render(<AdminSettingsPage />)
  fireEvent.click(screen.getByTestId('save-site-settings-btn'))
  expect(await screen.findByTestId('site-settings-error')).toHaveTextContent(
    'nope',
  )
})
