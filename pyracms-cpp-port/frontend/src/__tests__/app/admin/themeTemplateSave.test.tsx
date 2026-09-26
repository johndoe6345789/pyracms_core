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
  HexColorInput: () => <i />,
}))

beforeAll(stubResizeObserver)

beforeEach(() => {
  jest.resetAllMocks()
  m.get.mockRejectedValue(new Error('x'))
})

it('style editor saves the theme as a setting', async () => {
  m.put.mockResolvedValue({})
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByLabelText('Use Sunset Boulevard'))
  fireEvent.click(screen.getByTestId('save-style-btn'))
  await waitFor(() =>
    expect(m.put).toHaveBeenCalledWith(
      '/api/settings/site_theme?tenant_id=1',
      expect.objectContaining({ name: 'site_theme', tenantId: 1 }),
    ),
  )
  expect(await screen.findByTestId('saved-chip')).toBeInTheDocument()
})

it('style editor loads the saved theme and shows save errors', async () => {
  const saved = { primaryColor: '#ff0000' }
  m.get.mockResolvedValue({ data: { value: JSON.stringify(saved) } })
  m.put.mockRejectedValue({ response: { data: { error: 'nope' } } })
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByLabelText('Use Sunset Boulevard'))
  fireEvent.click(screen.getByTestId('save-style-btn'))
  expect(await screen.findByTestId('theme-error')).toHaveTextContent('nope')
})

it('has nothing to save until something changes, and can undo', async () => {
  render(<StyleEditorPage />)
  expect(screen.getByTestId('save-style-btn')).toBeDisabled()
  fireEvent.click(screen.getByLabelText('Use Neon Penguin'))
  expect(screen.getByTestId('unsaved-chip')).toBeInTheDocument()
  expect(screen.getByTestId('save-style-btn')).toBeEnabled()
  fireEvent.click(screen.getByTestId('undo-btn'))
  await waitFor(() => expect(screen.queryByTestId('unsaved-chip')).toBeNull())
})

it('edits the dark look separately from the light one', async () => {
  m.put.mockResolvedValue({})
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByTestId('mode-dark'))
  fireEvent.click(screen.getByLabelText('Use Terminal Green'))
  fireEvent.click(screen.getByTestId('save-style-btn'))
  await waitFor(() => expect(m.put).toHaveBeenCalled())
  const saved = JSON.parse(m.put.mock.calls[0][1].value)
  expect(saved.dark.primaryColor).toBe('#39ff14')
  expect(saved.light.primaryColor).toBe('#1976d2')
})
