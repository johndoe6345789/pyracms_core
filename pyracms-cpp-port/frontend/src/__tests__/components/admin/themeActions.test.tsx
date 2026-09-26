import { render, screen, fireEvent } from '@testing-library/react'
import ThemeActions from '@/components/admin/styles/ThemeActions'

it('ThemeActions fire callbacks', () => {
  const p = { onReset: jest.fn(), onExport: jest.fn(), onImport: jest.fn() }
  render(<ThemeActions {...p} />)
  for (const n of [
    'Reset this look to default',
    'Export JSON',
    'Import JSON',
  ]) {
    fireEvent.click(screen.getByRole('button', { name: n }))
  }
  Object.values(p).forEach((f) => expect(f).toHaveBeenCalled())
})
