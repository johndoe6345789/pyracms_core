import { render, screen, fireEvent } from '@testing-library/react'
import ColorPickerField from '@/components/admin/styles/ColorPickerField'
import ThemeActions from '@/components/admin/styles/ThemeActions'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'

jest.mock('react-colorful', () => ({
  HexColorPicker: ({ onChange }: { onChange: (c: string) => void }) => (
    <button data-testid="picker" onClick={() => onChange('#000')} />
  ),
}))

it('ColorPickerField toggles the picker and emits', () => {
  const onChange = jest.fn()
  render(<ColorPickerField label="L" color="#fff" onChange={onChange} />)
  expect(screen.queryByTestId('picker')).toBeNull()
  fireEvent.click(screen.getByTestId('swatch-L'))
  fireEvent.click(screen.getByTestId('picker'))
  expect(onChange).toHaveBeenCalledWith('#000')
  fireEvent.change(screen.getByLabelText('L'), { target: { value: '#111' } })
  expect(onChange).toHaveBeenCalledWith('#111')
})

it('ThemeActions fire callbacks', () => {
  const p = { onReset: jest.fn(), onExport: jest.fn(),
    onImport: jest.fn() }
  render(<ThemeActions {...p} />)
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  for (const n of ['Reset', 'Export JSON', 'Import JSON']) {
    fireEvent.click(screen.getByRole('button', { name: n }))
  }
  Object.values(p).forEach((f) => expect(f).toHaveBeenCalled())
})

it('ThemeControls updates colors, font and sliders', () => {
  const update = jest.fn()
  render(<ThemeControls theme={DEFAULT_THEME} update={update} />)
  fireEvent.click(screen.getByTestId('swatch-Primary Color'))
  fireEvent.click(screen.getByTestId('picker'))
  expect(update).toHaveBeenCalledWith('primaryColor', '#000')
  fireEvent.mouseDown(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'Inter' }))
  expect(update).toHaveBeenCalledWith('fontFamily', 'Inter, sans-serif')
  const sliders = screen.getAllByRole('slider')
  fireEvent.change(sliders[0]!, { target: { value: 12 } })
  fireEvent.change(sliders[1]!, { target: { value: 10 } })
  expect(update).toHaveBeenCalledWith('borderRadius', 12)
  expect(update).toHaveBeenCalledWith('spacing', 10)
})

it('ThemePreview renders', () => {
  render(<ThemePreview theme={DEFAULT_THEME} />)
  expect(screen.getByText('Sample Article Title')).toBeInTheDocument()
  expect(screen.getByText('Secondary Element')).toBeInTheDocument()
})
