import { render, screen, fireEvent } from '@testing-library/react'
import { DetailedErrorAlert } from '@/components/common/DetailedErrorAlert'
import { apiErrorDetails } from '@/lib/apiError'

describe('DetailedErrorAlert', () => {
  it('shows nothing without a message', () => {
    render(<DetailedErrorAlert message="" testId="e" />)
    expect(screen.queryByTestId('e')).toBeNull()
  })

  it('has no arrow when there are no details', () => {
    render(<DetailedErrorAlert message="Nope" testId="e" />)
    expect(screen.getByText('Nope')).toBeInTheDocument()
    expect(screen.queryByTestId('e-toggle')).toBeNull()
  })

  it('reveals the details behind the down arrow', () => {
    render(
      <DetailedErrorAlert message="Nope" details="Status: 400" testId="e" />,
    )
    expect(screen.queryByTestId('e-details')).toBeNull()
    const arrow = screen.getByTestId('e-toggle')
    expect(arrow).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(arrow)
    expect(screen.getByTestId('e-details')).toHaveTextContent('Status: 400')
    expect(arrow).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('apiErrorDetails', () => {
  it('lists the request, status and the server message', () => {
    const err = { response: { status: 400, data: { error: 'Bad renderer' } } }
    expect(apiErrorDetails(err, 'POST /api/articles')).toBe(
      'Request: POST /api/articles\nStatus: 400\nServer said: Bad renderer',
    )
  })

  it('says so when the server never answered', () => {
    expect(apiErrorDetails(new Error('x'), 'GET /a')).toBe(
      'Request: GET /a\nNo response from the server',
    )
  })
})
