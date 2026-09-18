import { render, screen, fireEvent } from '@testing-library/react'
import { CreateThreadForm } from '@/components/forum/CreateThreadForm'
import { QuickReplyForm } from '@/components/forum/QuickReplyForm'

const setters = {
  setTitle: jest.fn(), setDescription: jest.fn(), setContent: jest.fn(),
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
      <CreateThreadForm {...base} error="bad" onSubmit={onSubmit} />)
    expect(screen.getByTestId('form-error-alert')).toHaveTextContent('bad')
    fireEvent.click(screen.getByTestId('create-thread-submit'))
    expect(onSubmit).toHaveBeenCalled()
    rerender(<CreateThreadForm {...base} loading />)
    expect(screen.getByTestId('create-thread-submit')).toBeDisabled()
    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })
  it('links cancel to the given or default href', () => {
    const { rerender } = render(<CreateThreadForm {...base} />)
    expect(screen.getByTestId('create-thread-cancel'))
      .toHaveAttribute('href', '/site/s/forum')
    rerender(<CreateThreadForm {...base} cancelHref="/x" />)
    expect(screen.getByTestId('create-thread-cancel'))
      .toHaveAttribute('href', '/x')
  })
})

describe('QuickReplyForm', () => {
  it('types, throttles nothing and submits', () => {
    const onChange = jest.fn()
    const onTyping = jest.fn()
    const onSubmit = jest.fn()
    render(<QuickReplyForm value="hi" onChange={onChange}
      onTyping={onTyping} onSubmit={onSubmit} error="oops" />)
    fireEvent.change(screen.getByTestId('quick-reply-input'),
      { target: { value: 'yo' } })
    expect(onChange).toHaveBeenCalledWith('yo')
    expect(onTyping).toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('quick-reply-submit'))
    expect(onSubmit).toHaveBeenCalled()
    expect(screen.getByTestId('reply-error')).toHaveTextContent('oops')
  })
  it('disables submit when empty or submitting', () => {
    const { rerender } = render(<QuickReplyForm value=" " onChange={jest.fn()}
      />)
    expect(screen.getByTestId('quick-reply-submit')).toBeDisabled()
    rerender(<QuickReplyForm value="a" submitting onChange={jest.fn()} />)
    expect(screen.getByText('Posting...')).toBeInTheDocument()
  })
  it('explains locked threads and signed-out visitors', () => {
    const { rerender } = render(
      <QuickReplyForm value="" onChange={jest.fn()} locked />)
    expect(screen.getByTestId('reply-disabled-notice'))
      .toHaveTextContent(/locked/)
    rerender(<QuickReplyForm value="" onChange={jest.fn()}
      isAuthenticated={false} />)
    expect(screen.getByText('Sign in').closest('a'))
      .toHaveAttribute('href', '/auth/login')
  })
})
