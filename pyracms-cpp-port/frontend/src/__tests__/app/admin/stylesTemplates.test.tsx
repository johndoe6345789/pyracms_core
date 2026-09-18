import { render, screen, fireEvent } from '@testing-library/react'
import StylesPage from '@/app/site/[slug]/(admin)/admin/styles/page'
import TemplatesPage from
  '@/app/site/[slug]/(admin)/admin/templates/page'
import AnalyticsPage from
  '@/app/site/[slug]/(admin)/admin/analytics/page'
import {
  exportTheme, importTheme, DEFAULT_THEME,
} from '@/components/admin/styles/themeConfig'

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="ed"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))
jest.mock('@/components/admin/charts/PageViewChart', () => ({
  PageViewChart: () => <div>pv</div>,
}))
jest.mock('@/components/admin/charts/TopContentChart', () => ({
  TopContentChart: () => <div>tc</div>,
}))
jest.mock('@/components/admin/charts/TrafficPieChart', () => ({
  TrafficPieChart: () => <div>tp</div>,
}))

describe('styles page', () => {
  afterEach(() => jest.restoreAllMocks())

  it('edits color, toggles picker, resets, saves', () => {
    render(<StylesPage />)
    const box = screen.getByLabelText('Primary Color')
    fireEvent.change(box, { target: { value: '#000000' } })
    expect(box).toHaveValue('#000000')
    fireEvent.click(screen.getByTestId('swatch-Primary Color'))
    fireEvent.click(screen.getByTestId('swatch-Primary Color'))
    fireEvent.click(screen.getByText('Reset'))
    expect(box).toHaveValue(DEFAULT_THEME.primaryColor)
    const log = jest.spyOn(console, 'log').mockImplementation()
    fireEvent.click(screen.getByText('Save'))
    expect(log).toHaveBeenCalled()
  })

  it('exports theme as download', () => {
    URL.createObjectURL = jest.fn(() => 'blob:x')
    URL.revokeObjectURL = jest.fn()
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation()
    exportTheme(DEFAULT_THEME)
    expect(click).toHaveBeenCalled()
    render(<StylesPage />)
    fireEvent.click(screen.getByText('Export JSON'))
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it('imports theme, ignores bad json and no file', async () => {
    const apply = jest.fn()
    let input!: HTMLInputElement
    const orig = document.createElement.bind(document)
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((t: string) => {
        const el = orig(t)
        if (t === 'input') {
          input = el as HTMLInputElement
          el.click = jest.fn()
        }
        return el
      })
    const err = jest.spyOn(console, 'error').mockImplementation()
    importTheme(apply)
    const send = (files: File[]) =>
      (input.onchange as any)({ target: { files } })
    send([])
    const read = (txt: string) => {
      send([new File([txt], 't.json')])
      return new Promise((r) => setTimeout(r, 50))
    }
    await read('{"primaryColor":"#111111"}')
    expect(apply).toHaveBeenCalledWith(
      expect.objectContaining({ primaryColor: '#111111' }),
    )
    await read('nope')
    expect(err).toHaveBeenCalled()
  })

  it('import button triggers file chooser', () => {
    render(<StylesPage />)
    const click = jest
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation()
    fireEvent.click(screen.getByText('Import JSON'))
    expect(click).toHaveBeenCalled()
  })
})

describe('templates page', () => {
  afterEach(() => jest.restoreAllMocks())

  it('edits, previews, switches section, resets', () => {
    render(<TemplatesPage />)
    fireEvent.change(screen.getByTestId('ed'), {
      target: { value: '<p>hi</p>' },
    })
    expect(screen.getByTestId('template-preview-body').innerHTML)
      .toContain('hi')
    fireEvent.click(screen.getByText('Preview'))
    expect(screen.queryByTestId('template-preview-body')).toBeNull()
    fireEvent.click(screen.getByText('Reset'))
    const log = jest.spyOn(console, 'log').mockImplementation()
    fireEvent.click(screen.getByText('Save'))
    expect(log).toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Footer'))
    expect((screen.getByTestId('ed') as HTMLTextAreaElement).value)
      .toContain('<footer>')
  })
})

it('analytics page renders tables', () => {
  render(<AnalyticsPage />)
  expect(screen.getByText('Top Referrers')).toBeInTheDocument()
  expect(screen.getByText('Google Search')).toBeInTheDocument()
  expect(screen.getByText('react hooks')).toBeInTheDocument()
})
