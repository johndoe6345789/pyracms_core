import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StyleEditorPage from '@/app/site/[slug]/(admin)/admin/styles/page'
import TemplateEditorPage from
  '@/app/site/[slug]/(admin)/admin/templates/page'
import { m } from '../../helpers/scopeApi'
import { stubResizeObserver } from '../../helpers/scopeMocks'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)
jest.mock('next/navigation', () => require('../../helpers/scopeMocks').navMock)
jest.mock('@/hooks/useTenantId',
  () => require('../../helpers/scopeMocks').tenantMock)
jest.mock('@monaco-editor/react',
  () => require('../../helpers/scopeMocks').monacoMock)
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
  await waitFor(() => expect(m.put).toHaveBeenCalledWith(
    '/api/settings/site_theme?tenant_id=1',
    expect.objectContaining({ name: 'site_theme', tenantId: 1 })))
  expect(await screen.findByText('Theme saved.')).toBeInTheDocument()
})

it('style editor loads the saved theme and shows save errors', async () => {
  const saved = { primaryColor: '#ff0000' }
  m.get.mockResolvedValue({ data: { value: JSON.stringify(saved) } })
  m.put.mockRejectedValue({ response: { data: { error: 'nope' } } })
  render(<StyleEditorPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByTestId('theme-error'))
    .toHaveTextContent('nope')
})

it('template editor saves templates as a setting', async () => {
  m.put.mockResolvedValue({})
  render(<TemplateEditorPage />)
  fireEvent.change(screen.getByTestId('monaco'),
    { target: { value: '<p>new</p>' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(m.put).toHaveBeenCalledWith(
    '/api/settings/site_templates?tenant_id=1',
    expect.objectContaining({
      value: expect.stringContaining('<p>new</p>') })))
  expect(await screen.findByText('Templates saved.')).toBeInTheDocument()
})

it('template editor loads saved templates and reports errors', async () => {
  m.get.mockResolvedValue({
    data: { value: JSON.stringify({ header: '<h1>saved</h1>' }) } })
  m.put.mockRejectedValue(new Error('x'))
  render(<TemplateEditorPage />)
  await waitFor(() => expect(screen.getByTestId('monaco'))
    .toHaveValue('<h1>saved</h1>'))
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByTestId('templates-error')).toBeInTheDocument()
})
