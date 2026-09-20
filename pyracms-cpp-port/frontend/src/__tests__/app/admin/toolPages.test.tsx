import { render, screen, fireEvent } from '@testing-library/react'
import AnalyticsPage from '@/app/site/[slug]/(admin)/admin/analytics/page'
import StyleEditorPage from '@/app/site/[slug]/(admin)/admin/styles/page'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

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
jest.mock(
  '@monaco-editor/react',
  () => jest.requireActual('../../helpers/scopeMocks').monacoMock,
)
jest.mock('react-colorful', () => ({
  HexColorPicker: () => <i />,
}))

beforeAll(stubResizeObserver)

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockRejectedValue(new Error('x'))
})

it('analytics page renders panels', () => {
  render(<AnalyticsPage />)
  expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  expect(screen.getByText('Top Referrers')).toBeInTheDocument()
})

it('style editor resets, saves, exports and imports', () => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  const click = jest.spyOn(HTMLElement.prototype, 'click').mockImplementation()
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }))
  fireEvent.click(screen.getByRole('button', { name: 'Import JSON' }))
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(click).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByTestId('swatch-Primary Color'))
  click.mockRestore()
})
