import { render, screen, fireEvent } from '@testing-library/react'
import { CreateThreadForm } from '@/components/forum/CreateThreadForm'

const setters = {
  setTitle: jest.fn(),
  setDescription: jest.fn(),
  setContent: jest.fn(),
}
const base = { slug: 's', title: '', description: '', content: '', ...setters }

const type = (id: string, value: string) => {
  const el = screen.getByTestId(id)
  fireEvent.change(el.querySelector('input,textarea')!, { target: { value } })
}

describe('CreateThreadForm', () => {
  it('forwards field changes', () => {
    render(<CreateThreadForm {...base} />)
    type('thread-title-input', 'T')
    type('thread-description-input', 'D')
    type('thread-content-input', 'C')
    expect(setters.setTitle).toHaveBeenCalledWith('T')
    expect(setters.setDescription).toHaveBeenCalledWith('D')
    expect(setters.setContent).toHaveBeenCalledWith('C')
  })
  it('submits, shows errors and loading', () => {
    const onSubmit = jest.fn()
    const { rerender } = render(
      <CreateThreadForm {...base} error="bad" onSubmit={onSubmit} />,
    )
    expect(screen.getByTestId('form-error-alert')).toHaveTextContent('bad')
    fireEvent.click(screen.getByTestId('create-thread-submit'))
    expect(onSubmit).toHaveBeenCalled()
    rerender(<CreateThreadForm {...base} loading />)
    expect(screen.getByTestId('create-thread-submit')).toBeDisabled()
    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })
  it('links cancel to the given or default href', () => {
    const { rerender } = render(<CreateThreadForm {...base} />)
    expect(screen.getByTestId('create-thread-cancel')).toHaveAttribute(
      'href',
      '/site/s/forum',
    )
    rerender(<CreateThreadForm {...base} cancelHref="/x" />)
    expect(screen.getByTestId('create-thread-cancel')).toHaveAttribute(
      'href',
      '/x',
    )
  })
})
