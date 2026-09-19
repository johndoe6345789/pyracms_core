/** Tests for TenantDeleteDialog a11y attributes and test ids. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderDialog } from '../../helpers/tenantDeleteDialogHelpers'

describe('TenantDeleteDialog', () => {
  it('Dialog has aria-labelledby="confirm-delete-title"', () => {
    renderDialog({ open: true })
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'confirm-delete-title',
    )
  })

  it('DialogTitle has id="confirm-delete-title"', () => {
    renderDialog({ open: true })
    const title = screen.getByText('Delete Tenant?')
    expect(title.closest('[id="confirm-delete-title"]')).toBeInTheDocument()
  })

  it('data-testid="tenant-delete-dialog" is present', () => {
    renderDialog({ open: true })
    expect(screen.getByTestId('tenant-delete-dialog')).toBeInTheDocument()
  })

  it('data-testid="cancel-delete-tenant" is present', () => {
    renderDialog({ open: true })
    expect(screen.getByTestId('cancel-delete-tenant')).toBeInTheDocument()
  })

  it('data-testid="confirm-delete-tenant" is present', () => {
    renderDialog({ open: true })
    expect(screen.getByTestId('confirm-delete-tenant')).toBeInTheDocument()
  })
})
