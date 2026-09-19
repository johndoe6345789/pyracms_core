import { render, screen, fireEvent } from '@testing-library/react'
import TemplatePreview from '@/components/admin/templates/TemplatePreview'
import TemplateToolbar from '@/components/admin/templates/TemplateToolbar'

jest.mock('@/lib/api', () => require('../../helpers/apiMock').apiMock)

it('TemplatePreview sanitizes html', () => {
  render(<TemplatePreview section="header"
    html={'<b>ok</b><script>alert(1)</script>'} />)
  const body = screen.getByTestId('template-preview-body')
  expect(body.innerHTML).toContain('<b>ok</b>')
  expect(body.innerHTML).not.toContain('script')
})

it('TemplateToolbar wires controls', () => {
  const p = { onSection: jest.fn(), onTogglePreview: jest.fn(),
    onReset: jest.fn() }
  render(<TemplateToolbar section="header" showPreview {...p} />)
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Footer' }))
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  expect(p.onSection).toHaveBeenCalledWith('footer')
  expect(p.onTogglePreview).toHaveBeenCalled()
  expect(p.onReset).toHaveBeenCalled()
})
