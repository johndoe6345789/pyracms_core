import { render, screen, fireEvent } from '@testing-library/react'
import { QuickReplyForm } from '@/components/forum/QuickReplyForm'

describe('QuickReplyForm', () => {
  it('types, throttles nothing and submits', () => {
    const onChange = jest.fn()
    const onTyping = jest.fn()
    const onSubmit = jest.fn()
    render(
      <QuickReplyForm
        value="hi"
        onChange={onChange}
        onTyping={onTyping}
        onSubmit={onSubmit}
        error="oops"
      />,
    )
    fireEvent.change(screen.getByTestId('quick-reply-input'), {
      target: { value: 'yo' },
    })
    expect(onChange).toHaveBeenCalledWith('yo')
    expect(onTyping).toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('quick-reply-submit'))
    expect(onSubmit).toHaveBeenCalled()
    expect(screen.getByTestId('reply-error')).toHaveTextContent('oops')
  })
  it('disables submit when empty or submitting', () => {
    const { rerender } = render(
      <QuickReplyForm value=" " onChange={jest.fn()} />,
    )
    expect(screen.getByTestId('quick-reply-submit')).toBeDisabled()
    rerender(<QuickReplyForm value="a" submitting onChange={jest.fn()} />)
    expect(screen.getByText('Posting...')).toBeInTheDocument()
  })
  it('explains locked threads and signed-out visitors', () => {
    const { rerender } = render(
      <QuickReplyForm value="" onChange={jest.fn()} locked />,
    )
    expect(screen.getByTestId('reply-disabled-notice')).toHaveTextContent(
      /locked/,
    )
    rerender(
      <QuickReplyForm value="" onChange={jest.fn()} isAuthenticated={false} />,
    )
    expect(screen.getByText('Sign in').closest('a')).toHaveAttribute(
      'href',
      '/auth/login',
    )
  })
})
