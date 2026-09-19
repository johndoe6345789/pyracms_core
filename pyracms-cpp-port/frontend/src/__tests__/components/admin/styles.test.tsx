import { render, screen, fireEvent } from '@testing-library/react'
import ColorPickerField from '@/components/admin/styles/ColorPickerField'
import ThemeActions from '@/components/admin/styles/ThemeActions'
import ThemeControls from '@/components/admin/styles/ThemeControls'
import ThemePreview from '@/components/admin/styles/ThemePreview'
import {
  DEFAULT_THEME, exportTheme, importTheme,
} from '@/components/admin/styles/themeConfig'

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
  const p = { onReset: jest.fn(), onSave: jest.fn(), onExport: jest.fn(),
    onImport: jest.fn() }
  render(<ThemeActions {...p} />)
  for (const n of ['Reset', 'Save', 'Export JSON', 'Import JSON']) {
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
})

it('exportTheme downloads json', () => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation()
  exportTheme(DEFAULT_THEME)
  expect(click).toHaveBeenCalled()
  expect(URL.revokeObjectURL).toHaveBeenCalled()
})

describe('importTheme', () => {
  let input: HTMLInputElement
  beforeEach(() => {
    const create = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((t: string) => {
      const el = create(t)
      if (t === 'input') {
        input = el as HTMLInputElement
        jest.spyOn(el, 'click').mockImplementation()
      }
      return el
    })
  })
  afterEach(() => jest.restoreAllMocks())

  const pick = (files: File[]) => {
    Object.defineProperty(input, 'files',
      { value: files, configurable: true })
    input.onchange!({ target: input } as unknown as Event)
  }

  it('applies valid json', async () => {
    const apply = jest.fn()
    importTheme(apply)
    pick([new File(['{"primaryColor":"#123"}'], 't.json')])
    await new Promise((r) => setTimeout(r, 500))
    expect(apply).toHaveBeenCalledWith(
      { ...DEFAULT_THEME, primaryColor: '#123' })
  })

  it('ignores no file and logs invalid json', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation()
    const apply = jest.fn()
    importTheme(apply)
    pick([])
    pick([new File(['{bad'], 't.json')])
    await new Promise((r) => setTimeout(r, 500))
    expect(apply).not.toHaveBeenCalled()
    expect(err).toHaveBeenCalled()
  })
})
