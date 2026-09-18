import { render, screen } from '@testing-library/react'
import { CodeOutput } from '@/components/code/CodeOutput'
import { formatTime } from '@/components/code/OutputHeader'

it('formats execution time', () => {
  expect(formatTime(250)).toBe('250ms')
  expect(formatTime(1500)).toBe('1.50s')
})

it('shows a loading state', () => {
  render(<CodeOutput isLoading />)
  expect(screen.getByTestId('code-output-loading')).toBeInTheDocument()
})

it('renders nothing without a result', () => {
  const { container } = render(<CodeOutput />)
  expect(container).toBeEmptyDOMElement()
})

it('shows successful stdout with timing', () => {
  render(<CodeOutput stdout="hi" exitCode={0} executionTime={12} />)
  expect(screen.getByTestId('code-output-stdout')).toHaveTextContent('hi')
  expect(screen.getByText('Exit: 0')).toBeInTheDocument()
  expect(screen.getByText('12ms')).toBeInTheDocument()
  expect(screen.getByLabelText('Success')).toBeInTheDocument()
  expect(screen.queryByTestId('code-output-stderr')).toBeNull()
})

it('shows failures on stderr', () => {
  render(<CodeOutput stderr="boom" exitCode={2} />)
  expect(screen.getByTestId('code-output-stderr')).toHaveTextContent('boom')
  expect(screen.getByLabelText('Error')).toBeInTheDocument()
})

it('shows a neutral header when no exit code is known', () => {
  render(<CodeOutput stdout="x" exitCode={null} />)
  expect(screen.getByText('Output')).toBeInTheDocument()
  expect(screen.queryByText(/Exit:/)).toBeNull()
})
