import { render, screen, fireEvent } from '@testing-library/react'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import SourceUpload from '@/components/gamedep/SourceUpload'

describe('gamedep forms', () => {
  it('BasicInfoForm reports edits', () => {
    const p = { onDisplayNameChange: jest.fn(), onDescriptionChange: jest.fn() }
    render(
      <BasicInfoForm
        nameSlug="n"
        displayName="D"
        description="x"
        tags={[]}
        tagInput=""
        onTagInputChange={jest.fn()}
        onAddTag={jest.fn()}
        onDeleteTag={jest.fn()}
        {...p}
      />,
    )
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'E' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'y' },
    })
    expect(p.onDisplayNameChange).toHaveBeenCalledWith('E')
    expect(p.onDescriptionChange).toHaveBeenCalledWith('y')
  })

  it('BinaryUpload reports os and arch', () => {
    const [o, a] = [jest.fn(), jest.fn()]
    render(
      <BinaryUpload
        selectedOs="Linux"
        onOsChange={o}
        selectedArch="x64"
        onArchChange={a}
      />,
    )
    const [os, arch] = screen.getAllByRole('combobox')
    fireEvent.mouseDown(os!)
    fireEvent.click(screen.getByRole('option', { name: 'macOS' }))
    fireEvent.mouseDown(arch!)
    fireEvent.click(screen.getByRole('option', { name: 'arm64' }))
    expect(o).toHaveBeenCalledWith('macOS')
    expect(a).toHaveBeenCalledWith('arm64')
  })

  it('SourceUpload renders a picker', () => {
    render(<SourceUpload />)
    expect(screen.getByText('Select Source Archive')).toBeInTheDocument()
  })
})
