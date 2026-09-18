import { render, screen, fireEvent } from '@testing-library/react'
import { CodeEditor } from '@/components/code/CodeEditor'
import { detectLanguage } from '@/components/code/languages'

jest.mock('@monaco-editor/react', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (p: {
      value: string
      onChange: (v?: string) => void
      options: { readOnly: boolean }
    }) => React.createElement('textarea', {
      'data-testid': 'monaco', value: p.value,
      readOnly: p.options.readOnly,
      onChange: (e: { target: { value: string } }) =>
        p.onChange(e.target.value),
    }),
  }
})

describe('detectLanguage', () => {
  it.each([
    ['def a():\n print(1)', 'python'],
    ['const a = 1', 'javascript'],
    ['#include <x>', 'cpp'],
    ['fn main() { let mut a }', 'rust'],
    ['package main\nfunc a() {}', 'go'],
    ['public class A {}', 'java'],
    ['hello', null],
  ])('%s -> %s', (code, lang) => {
    expect(detectLanguage(code)).toBe(lang)
  })
})

describe('CodeEditor', () => {
  it('emits changes without auto-detect for known languages', () => {
    const onChange = jest.fn()
    const onLang = jest.fn()
    render(<CodeEditor value="" onChange={onChange} language="python"
      onLanguageChange={onLang} />)
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'const something = 12345' },
    })
    expect(onChange).toHaveBeenCalled()
    expect(onLang).not.toHaveBeenCalled()
  })
  it('detects the language for plaintext', () => {
    const onLang = jest.fn()
    render(<CodeEditor value="" onChange={jest.fn()} language="plaintext"
      onLanguageChange={onLang} />)
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'const something = 12345' },
    })
    expect(onLang).toHaveBeenCalledWith('javascript')
  })
  it('does not override when nothing is detected', () => {
    const onLang = jest.fn()
    render(<CodeEditor value="" onChange={jest.fn()} language="plaintext"
      onLanguageChange={onLang} />)
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'just some plain words here' },
    })
    expect(onLang).not.toHaveBeenCalled()
  })
  it('offers a language picker unless read only', () => {
    const onLang = jest.fn()
    const { rerender } = render(<CodeEditor value="" onChange={jest.fn()}
      language="python" onLanguageChange={onLang} />)
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Rust'))
    expect(onLang).toHaveBeenCalledWith('rust')
    rerender(<CodeEditor value="" onChange={jest.fn()} language="python"
      onLanguageChange={onLang} readOnly />)
    expect(screen.queryByTestId('code-editor-language')).toBeNull()
    expect(screen.getByTestId('monaco')).toHaveAttribute('readonly')
  })
})
