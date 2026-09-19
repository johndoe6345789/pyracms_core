import { render, screen, fireEvent } from '@testing-library/react'
import { CodeEditor } from '@/components/code/CodeEditor'

jest.mock('@monaco-editor/react', () =>
  jest.requireActual('../../helpers/monacoMock').monacoMock(),
)

describe('CodeEditor', () => {
  it('emits changes without auto-detect for known languages', () => {
    const onChange = jest.fn()
    const onLang = jest.fn()
    render(
      <CodeEditor
        value=""
        onChange={onChange}
        language="python"
        onLanguageChange={onLang}
      />,
    )
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'const something = 12345' },
    })
    expect(onChange).toHaveBeenCalled()
    expect(onLang).not.toHaveBeenCalled()
  })
  it('detects the language for plaintext', () => {
    const onLang = jest.fn()
    render(
      <CodeEditor
        value=""
        onChange={jest.fn()}
        language="plaintext"
        onLanguageChange={onLang}
      />,
    )
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'const something = 12345' },
    })
    expect(onLang).toHaveBeenCalledWith('javascript')
  })
  it('does not override when nothing is detected', () => {
    const onLang = jest.fn()
    render(
      <CodeEditor
        value=""
        onChange={jest.fn()}
        language="plaintext"
        onLanguageChange={onLang}
      />,
    )
    fireEvent.change(screen.getByTestId('monaco'), {
      target: { value: 'just some plain words here' },
    })
    expect(onLang).not.toHaveBeenCalled()
  })
})
