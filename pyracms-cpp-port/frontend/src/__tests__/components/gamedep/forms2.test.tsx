import { render, screen, fireEvent } from '@testing-library/react'
import BasicInfoForm from '@/components/gamedep/BasicInfoForm'
import BinaryUpload from '@/components/gamedep/BinaryUpload'
import SourceUpload from '@/components/gamedep/SourceUpload'
import EditActions from '@/components/gamedep/EditActions'
import EditCrumbs from '@/components/gamedep/EditCrumbs'
import GameDepDetail from '@/components/gamedep/GameDepDetail'
import GameDepTabs from '@/components/gamedep/GameDepTabs'
import { DEP_DETAIL } from '../../helpers/depDetailFixture'

describe('gamedep forms', () => {
  it('BasicInfoForm reports edits', () => {
    const p = { onDisplayNameChange: jest.fn(),
      onDescriptionChange: jest.fn() }
    render(<BasicInfoForm nameSlug="n" displayName="D" description="x"
      tags={[]} tagInput="" onTagInputChange={jest.fn()}
      onAddTag={jest.fn()} onDeleteTag={jest.fn()} {...p} />)
    fireEvent.change(screen.getByLabelText('Display Name'),
      { target: { value: 'E' } })
    fireEvent.change(screen.getByLabelText('Description'),
      { target: { value: 'y' } })
    expect(p.onDisplayNameChange).toHaveBeenCalledWith('E')
    expect(p.onDescriptionChange).toHaveBeenCalledWith('y')
  })

  it('BinaryUpload reports os and arch', () => {
    const [o, a] = [jest.fn(), jest.fn()]
    render(<BinaryUpload selectedOs="Linux" onOsChange={o}
      selectedArch="x64" onArchChange={a} />)
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

  it('EditActions saves and shows busy state', () => {
    const save = jest.fn()
    const { rerender } = render(
      <EditActions cancelHref="/c" saving={false} onSave={save} />)
    fireEvent.click(screen.getByText('Save Changes'))
    expect(save).toHaveBeenCalled()
    rerender(<EditActions cancelHref="/c" saving onSave={save} />)
    expect(screen.getByText('Saving...')).toBeDisabled()
  })

  it('EditCrumbs links to dependencies and detail', () => {
    render(<EditCrumbs slug="s" detailHref="/d" displayName="X" />)
    expect(screen.getByText('Dependencies'))
      .toHaveAttribute('href', '/site/s/dependencies')
    expect(screen.getByText('X')).toHaveAttribute('href', '/d')
  })

  it('GameDepDetail renders detail and tab changes', () => {
    const onTab = jest.fn()
    render(<GameDepDetail detail={DEP_DETAIL}
      editHref="/e" tabIndex={0} onTabChange={onTab}><p>kid</p>
    </GameDepDetail>)
    expect(screen.getByText('kid')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('tab-binaries'))
    expect(onTab).toHaveBeenCalledWith(1)
    expect(screen.getByTestId('edit-button'))
      .toHaveAttribute('href', '/e')
  })

  it('GameDepTabs is exported', () => {
    render(<GameDepTabs tabIndex={2} onTabChange={jest.fn()} />)
    expect(screen.getByTestId('tab-dependencies'))
      .toHaveAttribute('aria-selected', 'true')
  })
})
