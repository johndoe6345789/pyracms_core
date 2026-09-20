import '../../helpers/scopeModuleMocks'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StyleEditorPage from '@/app/site/[slug]/(admin)/admin/styles/page'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

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

it('style editor saves the theme as a setting', async () => {
  m.put.mockResolvedValue({})
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith(
      '/api/settings/site_theme?tenant_id=1',
      expect.objectContaining({ name: 'site_theme', tenantId: 1 }),
    ),
  )
  expect(await screen.findByText('Theme saved.')).toBeInTheDocument()
})

it('style editor loads the saved theme and shows save errors', async () => {
  const saved = { primaryColor: '#ff0000' }
  m.get.mockResolvedValue({ data: { value: JSON.stringify(saved) } })
  m.put.mockRejectedValue({ response: { data: { error: 'nope' } } })
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByTestId('theme-error')).toHaveTextContent('nope')
})
