import {
  DEFAULT_THEME,
  exportTheme,
  importTheme,
} from '@/components/admin/styles/themeConfig'

jest.mock('react-colorful', () => ({
  HexColorPicker: ({ onChange }: { onChange: (c: string) => void }) => (
    <button data-testid="picker" onClick={() => onChange('#000')} />
  ),
}))

it('exportTheme downloads json', () => {
  URL.createObjectURL = jest.fn(() => 'blob:x')
  URL.revokeObjectURL = jest.fn()
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
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
    Object.defineProperty(input, 'files', { value: files, configurable: true })
    input.onchange!({ target: input } as unknown as Event)
  }

  it('applies valid json', async () => {
    const apply = jest.fn()
    importTheme(apply)
    pick([new File(['{"primaryColor":"#123"}'], 't.json')])
    await new Promise((r) => setTimeout(r, 500))
    expect(apply).toHaveBeenCalledWith({
      ...DEFAULT_THEME,
      primaryColor: '#123',
    })
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
