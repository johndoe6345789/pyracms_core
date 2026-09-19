import { render, screen, fireEvent } from '@testing-library/react'
import { CodeEditor } from '@/components/code/CodeEditor'

jest.mock('@monaco-editor/react', () =>
  require('../../helpers/monacoMock').monacoMock(),
)

describe('CodeEditor', () => {
  it('offers a language picker unless read only', () => {
    const onLang = jest.fn()
    const { rerender } = render(
      <CodeEditor
        value=""
        onChange={jest.fn()}
        language="python"
        onLanguageChange={onLang}
      />,
    )
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Rust'))
    expect(onLang).toHaveBeenCalledWith('rust')
    rerender(
      <CodeEditor
        value=""
        onChange={jest.fn()}
        language="python"
        onLanguageChange={onLang}
        readOnly
      />,
    )
    expect(screen.queryByTestId('code-editor-language')).toBeNull()
    expect(screen.getByTestId('monaco')).toHaveAttribute('readonly')
  })
})
