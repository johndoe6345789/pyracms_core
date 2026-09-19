import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/components/articles/useAutoSave'

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

const ed = {
  getSelection: jest.fn(() => ({ s: 1 })),
  getModel: jest.fn(() => ({ getValueInRange: () => 'sel' })),
  executeEdits: jest.fn(),
  focus: jest.fn(),
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

describe('useAutoSave', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('saves after a delay and restores when empty', () => {
    const onChange = jest.fn()
    renderHook(() => useAutoSave('abc', onChange, 'key'))
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(localStorage.getItem('autosave-key')).toBe('abc')
    renderHook(() => useAutoSave('', onChange, 'key'))
    expect(onChange).toHaveBeenCalledWith('abc')
  })

  it('does nothing without a key', () => {
    const onChange = jest.fn()
    renderHook(() => useAutoSave('abc', onChange))
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
  })
})
