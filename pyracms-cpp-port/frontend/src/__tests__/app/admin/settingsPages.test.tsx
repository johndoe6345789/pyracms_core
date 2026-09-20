import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import AdminSettingsPage from '@/app/site/[slug]/(admin)/admin/settings/page'
import AdminFeaturesPage from '@/app/site/[slug]/(admin)/admin/features/page'
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

const box = (id: string) => within(screen.getByTestId(id)).getByRole('textbox')

beforeEach(() => {
  jest.resetAllMocks()
  m.put.mockResolvedValue({ data: {} })
  m.delete.mockResolvedValue({})
})

it('settings page edits and adds settings', async () => {
  routeGet({ '/api/settings': [{ id: 1, name: 'k', value: 'v' }] })
  render(<AdminSettingsPage />)
  fireEvent.click(screen.getByText('Advanced: raw settings'))
  await screen.findByText('k')
  fireEvent.click(screen.getByTestId('edit-setting-btn'))
  const input = within(
    screen.getAllByTestId('setting-value-input')[1]!,
  ).getByRole('textbox')
  fireEvent.change(input, { target: { value: 'n' } })
  fireEvent.click(screen.getByTestId('save-setting-btn'))
  await screen.findByText('n')
  fireEvent.click(screen.getByTestId('delete-setting-btn'))
  await waitFor(() => expect(screen.queryByText('n')).toBeNull())
  fireEvent.change(box('setting-key-input'), { target: { value: 'a' } })
  fireEvent.change(box('setting-value-input'), { target: { value: 'b' } })
  fireEvent.click(screen.getByTestId('add-setting-btn'))
  await screen.findByText('a')
})

it('features page toggles and saves', async () => {
  routeGet({ '/api/settings': [{ name: 'feature_forum', value: 'true' }] })
  render(<AdminFeaturesPage />)
  fireEvent.click(await screen.findByTestId('feature-toggle-articles'))
  fireEvent.click(screen.getByTestId('save-features-btn'))
  await screen.findByText(/saved successfully/)
  expect(m.put).toHaveBeenCalledTimes(5)
})
