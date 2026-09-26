import { render, screen, fireEvent } from '@testing-library/react'
import ColorPickerField from '@/components/admin/styles/ColorPickerField'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import { DEFAULT_THEME } from '@/components/admin/styles/themeConfig'

jest.mock('react-colorful', () => ({
  HexColorPicker: ({ onChange }: { onChange: (c: string) => void }) => (
    <button data-testid="picker" onClick={() => onChange('#000')} />
  ),
  HexColorInput: ({
    onChange,
    ...rest
  }: {
    onChange: (c: string) => void
    'aria-label': string
  }) => (
    <input
      aria-label={rest['aria-label']}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

it('ColorPickerField opens a picker, a hex box and ready colours', () => {
  const onChange = jest.fn()
  render(
    <ColorPickerField
      label="L"
      help="Used for x"
      color="#fff"
      onChange={onChange}
    />,
  )
  expect(screen.getByText('Used for x')).toBeInTheDocument()
  expect(screen.queryByTestId('picker')).toBeNull()
  fireEvent.click(screen.getByTestId('swatch-L'))
  fireEvent.click(screen.getByTestId('picker'))
  expect(onChange).toHaveBeenCalledWith('#000')
  fireEvent.change(screen.getByLabelText('L hex'), {
    target: { value: '#111' },
  })
  expect(onChange).toHaveBeenCalledWith('#111')
  fireEvent.click(screen.getByLabelText('Use #c62828'))
  expect(onChange).toHaveBeenCalledWith('#c62828')
})

it('ThemeControls updates colors, font, sliders and shows contrast', () => {
  const update = jest.fn()
  render(<ThemeControls theme={DEFAULT_THEME} update={update} />)
  fireEvent.click(screen.getByTestId('swatch-Primary Color'))
  fireEvent.click(screen.getByTestId('picker'))
  expect(update).toHaveBeenCalledWith('primaryColor', '#000')
  fireEvent.click(screen.getByTestId('font-Inter'))
  expect(update).toHaveBeenCalledWith('fontFamily', 'Inter, sans-serif')
  const sliders = screen.getAllByRole('slider', { hidden: true })
  fireEvent.change(sliders[0]!, { target: { value: 12 } })
  fireEvent.change(sliders[1]!, { target: { value: 10 } })
  expect(update).toHaveBeenCalledWith('borderRadius', 12)
  expect(update).toHaveBeenCalledWith('spacing', 10)
  expect(screen.getByTestId('contrast-Text on background')).toHaveTextContent(
    'AAA',
  )
})

it('ThemePreview renders', () => {
  render(<ThemePreview theme={DEFAULT_THEME} />)
  expect(screen.getByText('Sample Article Title')).toBeInTheDocument()
  expect(screen.getByText('Secondary Element')).toBeInTheDocument()
})
