import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { MonacoEditorComponent } from '@/components/articles/MonacoEditor'
import { useAutoSave } from '@/components/articles/useAutoSave'

let mounted: ((ed: unknown) => void) | undefined
let changed: ((v?: string) => void) | undefined
let lang = ''

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (p: {
    language: string
    onMount: (e: unknown) => void
    onChange: (v?: string) => void
  }) => {
    mounted = p.onMount
    changed = p.onChange
    lang = p.language
    return <div data-testid="monaco" />
  },
}))

function fakeEditor(sel: unknown, text: string | undefined = 'T') {
  return {
    getSelection: () => sel,
    getModel: () => (text === undefined
      ? null : { getValueInRange: () => text }),
    executeEdits: jest.fn(),
    focus: jest.fn(),
  }
}

it('maps language and forwards changes', () => {
  const onChange = jest.fn()
  render(<MonacoEditorComponent value="v" language="Markdown"
    onChange={onChange} />)
  expect(lang).toBe('markdown')
  act(() => changed!('n'))
  act(() => changed!(undefined))
  expect(onChange.mock.calls).toEqual([['n'], ['']])
})

it('falls back to plaintext for unknown language', () => {
  render(<MonacoEditorComponent value="v" language="zzz"
    onChange={jest.fn()} />)
  expect(lang).toBe('plaintext')
})

it('inserts toolbar text through the editor', () => {
  render(<MonacoEditorComponent value="v" language="HTML"
    onChange={jest.fn()} />)
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  const ed = fakeEditor({ r: 1 })
  act(() => mounted!(ed))
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(ed.executeEdits).toHaveBeenCalledWith('toolbar', [
    { range: { r: 1 }, text: '<strong>T</strong>' }])
  expect(ed.focus).toHaveBeenCalled()
})

it('handles missing selection and model', () => {
  render(<MonacoEditorComponent value="v" language="HTML"
    onChange={jest.fn()} />)
  const none = fakeEditor(null)
  act(() => mounted!(none))
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(none.executeEdits).not.toHaveBeenCalled()
  const nomodel = fakeEditor({ r: 2 }, undefined)
  act(() => mounted!(nomodel))
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(nomodel.executeEdits).toHaveBeenCalledWith('toolbar', [
    { range: { r: 2 }, text: '<strong></strong>' }])
})

it('shows preview in split and preview modes', () => {
  render(<MonacoEditorComponent value="<b>x</b>" language="HTML"
    onChange={jest.fn()} />)
  expect(screen.queryByTestId('preview-content')).toBeNull()
  fireEvent.click(screen.getByTestId('view-mode-split'))
  expect(screen.getByTestId('preview-content').innerHTML)
    .toBe('<b>x</b>')
  fireEvent.click(screen.getByTestId('view-mode-preview'))
  expect(screen.queryByTestId('monaco')).toBeNull()
})

it('shows empty preview when value empty', () => {
  render(<MonacoEditorComponent value="" language="HTML"
    onChange={jest.fn()} />)
  fireEvent.click(screen.getByTestId('view-mode-preview'))
  expect(screen.getByText('Nothing to preview yet.')).toBeInTheDocument()
})

describe('useAutoSave', () => {
  beforeEach(() => { jest.useFakeTimers(); localStorage.clear() })
  afterEach(() => jest.useRealTimers())

  it('does nothing without key', () => {
    const on = jest.fn()
    renderHook(() => useAutoSave('v', on))
    act(() => { jest.advanceTimersByTime(2000) })
    expect(localStorage.length).toBe(0)
    expect(on).not.toHaveBeenCalled()
  })

  it('saves after debounce', () => {
    renderHook(() => useAutoSave('v', jest.fn(), 'k'))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(localStorage.getItem('autosave-k')).toBe('v')
  })

  it('restores when value empty only', () => {
    localStorage.setItem('autosave-k', 'saved')
    const on = jest.fn()
    renderHook(() => useAutoSave('', on, 'k'))
    expect(on).toHaveBeenCalledWith('saved')
    const on2 = jest.fn()
    renderHook(() => useAutoSave('has', on2, 'k'))
    expect(on2).not.toHaveBeenCalled()
  })
})
