import { render, screen, fireEvent } from '@testing-library/react'
import IconPicker from '@/components/admin/menus/IconPicker'

it('shows the chosen icon and lets you clear it', () => {
  const onChange = jest.fn()
  render(<IconPicker value="TrainOutlined" onChange={onChange} />)
  expect(screen.getByTestId('icon-picker-btn')).toHaveTextContent('Train')
  fireEvent.click(screen.getByTestId('icon-clear-btn'))
  expect(onChange).toHaveBeenCalledWith('')
})

it('invites a choice when there is none, and hides the clear button', () => {
  render(<IconPicker value="" onChange={jest.fn()} />)
  expect(screen.getByTestId('icon-picker-btn')).toHaveTextContent(
    'Choose an icon',
  )
  expect(screen.queryByTestId('icon-clear-btn')).toBeNull()
})

it('searches the whole library and picks an icon', () => {
  const onChange = jest.fn()
  render(<IconPicker value="" onChange={onChange} />)
  fireEvent.click(screen.getByTestId('icon-picker-btn'))
  fireEvent.change(screen.getByTestId('icon-search'), {
    target: { value: 'camera' },
  })
  fireEvent.click(screen.getByTestId('icon-PhotoCameraOutlined'))
  expect(onChange).toHaveBeenCalledWith('PhotoCameraOutlined')
})

it('browses by subject and says when nothing matches', () => {
  render(<IconPicker value="" onChange={jest.fn()} />)
  fireEvent.click(screen.getByTestId('icon-picker-btn'))
  fireEvent.click(screen.getByRole('tab', { name: 'Transport' }))
  expect(screen.getByTestId('icon-TrainOutlined')).toBeInTheDocument()
  fireEvent.change(screen.getByTestId('icon-search'), {
    target: { value: 'zzzz' },
  })
  expect(screen.getByText('No icon matches that.')).toBeInTheDocument()
})
