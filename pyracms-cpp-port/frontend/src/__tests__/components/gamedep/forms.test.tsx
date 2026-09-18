import { render, screen, fireEvent } from '@testing-library/react'
import BinaryMatrix from '@/components/gamedep/BinaryMatrix'
import TagInput from '@/components/gamedep/TagInput'
import VersionSelect from '@/components/launcher/VersionSelect'

describe('BinaryMatrix', () => {
  it('lists builds with download links', () => {
    render(<BinaryMatrix binaries={[
      { os: 'Linux', arch: 'x64', size: '1 MB', url: 'http://d/x' }]} />)
    expect(screen.getByText('Linux')).toBeInTheDocument()
    expect(screen.getByRole('link'))
      .toHaveAttribute('href', 'http://d/x')
  })
})

describe('TagInput', () => {
  it('adds on click and Enter, and reports typing', () => {
    const onAdd = jest.fn()
    const onChange = jest.fn()
    render(<TagInput tags={['a']} tagInput="" onTagInputChange={onChange}
      onAddTag={onAdd} onDeleteTag={jest.fn()} />)
    const input = screen.getByPlaceholderText('Add tag...')
    fireEvent.change(input, { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalledWith('x')
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'a' })
    fireEvent.click(screen.getByText('Add'))
    expect(onAdd).toHaveBeenCalledTimes(2)
  })
})

describe('VersionSelect', () => {
  it('reports the chosen version', () => {
    const onChange = jest.fn()
    render(<VersionSelect value="1" onChange={onChange} versions={[
      { version: '1', published: true, date: '' },
      { version: '2', published: true, date: '' }]} />)
    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'v2' }))
    expect(onChange).toHaveBeenCalledWith('2')
  })
})
