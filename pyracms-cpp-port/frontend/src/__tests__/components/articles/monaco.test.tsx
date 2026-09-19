import { render, screen, fireEvent } from '@testing-library/react'
import { MonacoEditorComponent } from '@/components/articles/MonacoEditor'

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

const setup = (language = 'Markdown', value = 'v') => {
  const onChange = jest.fn()
  render(
    <MonacoEditorComponent
      value={value}
      onChange={onChange}
      language={language}
      autoSaveKey="k"
    />,
  )
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
  expect(ed.executeEdits).toHaveBeenCalledWith('toolbar', [
    { range: { s: 1 }, text: '**sel**' },
  ])
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
