import {
  render, screen, fireEvent, renderHook, act,
} from '@testing-library/react'
import {
  MonacoEditorComponent,
} from '@/components/articles/MonacoEditor'
import { useAutoSave } from '@/components/articles/useAutoSave'

const ed = {
  getSelection: jest.fn(() => ({ s: 1 })),
  getModel: jest.fn(() => ({ getValueInRange: () => 'sel' })),
  executeEdits: jest.fn(),
  focus: jest.fn(),
}

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (p: {
    value: string
    language: string
    onChange: (v?: string) => void
    onMount: (e: unknown) => void
  }) => (
    <div>
      <button data-testid="mount" onClick={() => p.onMount(ed)} />
      <button data-testid="type" onClick={() => p.onChange(undefined)} />
      <span data-testid="lang">{p.language}</span>
    </div>
  ),
}))

const setup = (language = 'Markdown', value = 'v') => {
  const onChange = jest.fn()
  render(<MonacoEditorComponent value={value} onChange={onChange}
    language={language} autoSaveKey="k" />)
  return onChange
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

it('inserts toolbar text through the editor', () => {
  setup()
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(ed.executeEdits).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('mount'))
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(ed.executeEdits).toHaveBeenCalledWith('toolbar',
    [{ range: { s: 1 }, text: '**sel**' }])
  ed.getSelection.mockReturnValueOnce(null as never)
  fireEvent.click(screen.getByTestId('toolbar-bold'))
  expect(ed.executeEdits).toHaveBeenCalledTimes(1)
  ed.getModel.mockReturnValueOnce(null as never)
  fireEvent.click(screen.getByTestId('toolbar-bold'))
})

it('maps languages and empty change', () => {
  const onChange = setup('Unknown')
  expect(screen.getByTestId('lang')).toHaveTextContent('plaintext')
  fireEvent.click(screen.getByTestId('type'))
  expect(onChange).toHaveBeenCalledWith('')
})

it('switches view modes', () => {
  setup('HTML', '<b>x</b>')
  fireEvent.click(screen.getByTestId('view-mode-split'))
  expect(screen.getByTestId('preview-content')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('view-mode-preview'))
  expect(screen.queryByTestId('mount')).toBeNull()
})

it('shows empty preview when there is no value', () => {
  setup('HTML', '')
  fireEvent.click(screen.getByTestId('view-mode-split'))
  expect(screen.getByText(/Nothing to preview/)).toBeInTheDocument()
})

describe('useAutoSave', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('saves after a delay and restores when empty', () => {
    const onChange = jest.fn()
    renderHook(() => useAutoSave('abc', onChange, 'key'))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(localStorage.getItem('autosave-key')).toBe('abc')
    renderHook(() => useAutoSave('', onChange, 'key'))
    expect(onChange).toHaveBeenCalledWith('abc')
  })

  it('does nothing without a key', () => {
    const onChange = jest.fn()
    renderHook(() => useAutoSave('abc', onChange))
    act(() => { jest.advanceTimersByTime(1000) })
    expect(onChange).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
  })
})
