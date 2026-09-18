import { render, screen, fireEvent } from '@testing-library/react'
import AclPage from '@/app/site/[slug]/(admin)/admin/acl/page'
import FilesPage from '@/app/site/[slug]/(admin)/admin/files/page'
import SettingsPage from
  '@/app/site/[slug]/(admin)/admin/settings/page'
import FeaturesPage from
  '@/app/site/[slug]/(admin)/admin/features/page'
import BackupPage from '@/app/site/[slug]/(admin)/admin/backup/page'
import DashboardPage from '@/app/site/[slug]/(admin)/admin/page'

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'demo' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/components/dashboard/DashboardStats', () => ({
  __esModule: true,
  default: () => <div data-testid="stats" />,
}))
const mockFn = jest.mockFn()
jest.mock('@/hooks/useAclEditor', () => ({
  useAclEditor: () => ({
    rules: [], newAction: 'allow', newPrincipal: '',
    newPermission: '', setNewAction: jest.mockFn(),
    setNewPrincipal: jest.mockFn(), setNewPermission: jest.mockFn(),
    handleAdd: jest.mockFn(), handleDelete: jest.mockFn(),
  }),
}))
jest.mock('@/hooks/useFileManager', () => ({
  useFileManager: () => ({
    files: [], deleteDialogOpen: false, selectedFile: null,
    dragOver: false, handleDeleteClick: mockFn,
    handleDeleteConfirm: mockFn, handleDeleteCancel: mockFn,
    handleDragOver: mockFn, handleDragLeave: mockFn, handleDrop: mockFn,
  }),
}))
jest.mock('@/hooks/useAdminSettings', () => ({
  useAdminSettings: () => ({
    settings: [], editingId: null, editValue: '', setEditValue: mockFn,
    newKey: '', setNewKey: mockFn, newValue: '', setNewValue: mockFn,
    handleStartEdit: mockFn, handleSaveEdit: mockFn, handleCancelEdit: mockFn,
    handleDelete: mockFn, handleAdd: mockFn,
  }),
}))
const mockToggle = jest.mockFn()
const mockSave = jest.mockFn()
jest.mock('@/hooks/useFeatureToggles', () => ({
  useFeatureToggles: () => ({
    features: [{ id: 1, name: 'Forum', description: 'd',
      enabled: true }],
    snackbarOpen: true, handleToggle: mockToggle, handleSave: mockSave,
    handleCloseSnackbar: mockFn,
  }),
}))
jest.mock('@/hooks/useBackupRestore', () => ({
  useBackupRestore: () => ({
    snackbar: { open: true, message: 'Done', severity: 'success' },
    fileInputRef: { current: null }, handleExportSettings: mockFn,
    handleExportMenus: mockFn, handleImportClick: mockFn,
    handleFileChange: mockFn, handleCloseSnackbar: mockFn,
  }),
}))

it.each([
  [AclPage, 'admin-acl-page'],
  [FilesPage, 'admin-files-page'],
  [SettingsPage, 'admin-settings-page'],
  [FeaturesPage, 'admin-features-page'],
  [DashboardPage, 'admin-dashboard'],
])('renders %#', (Page, id) => {
  render(<Page />)
  expect(screen.getByTestId(id)).toBeInTheDocument()
})

it('features page saves', () => {
  render(<FeaturesPage />)
  fireEvent.click(screen.getByTestId('mockSave-features-btn'))
  expect(mockSave).toHaveBeenCalled()
})

it('dashboard lists quick links', () => {
  render(<DashboardPage />)
  expect(screen.getByTestId('quick-links-grid')).toBeInTheDocument()
})

it('backup page shows snackbar', () => {
  render(<BackupPage />)
  expect(screen.getByText('Done')).toBeInTheDocument()
})
