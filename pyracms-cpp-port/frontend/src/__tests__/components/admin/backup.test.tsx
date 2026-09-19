import { render, screen, fireEvent } from '@testing-library/react'
import ExportButtons from '@/components/admin/ExportButtons'
import ImportSection from '@/components/admin/ImportSection'
import FeatureToggleCard from '@/components/admin/FeatureToggleCard'

it('ExportButtons triggers both exports', () => {
  const s = jest.fn()
  const m = jest.fn()
  render(<ExportButtons onExportSettings={s} onExportMenus={m} />)
  fireEvent.click(screen.getByRole('button', { name: 'Export Settings' }))
  fireEvent.click(screen.getByRole('button', { name: 'Export Menus' }))
  expect(s).toHaveBeenCalled()
  expect(m).toHaveBeenCalled()
})

it('ImportSection wires click and change', () => {
  const click = jest.fn()
  const change = jest.fn()
  render(
    <ImportSection
      fileInputRef={null}
      onImportClick={click}
      onFileChange={change}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: /Choose File/ }))
  fireEvent.change(screen.getByTestId('import-file-input'), {
    target: { files: [new File(['{}'], 'a.json')] },
  })
  expect(click).toHaveBeenCalled()
  expect(change).toHaveBeenCalled()
})

it('FeatureToggleCard toggles', () => {
  const onToggle = jest.fn()
  render(
    <FeatureToggleCard
      onToggle={onToggle}
      feature={{
        id: 'forum',
        name: 'Forum',
        description: 'd',
        enabled: true,
      }}
    />,
  )
  expect(screen.getByTestId('feature-card-forum')).toHaveTextContent('Forum')
  fireEvent.click(screen.getByRole('checkbox'))
  expect(onToggle).toHaveBeenCalledWith('forum')
})
