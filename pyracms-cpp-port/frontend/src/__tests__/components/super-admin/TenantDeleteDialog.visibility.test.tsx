/** Tests for TenantDeleteDialog visibility and copy. */
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { renderDialog } from
  '../../helpers/tenantDeleteDialogHelpers'

describe('TenantDeleteDialog', () => {
  it('dialog is not visible when open=false', () => {
    renderDialog({ open: false })
    // MUI Dialog keeps the node in the DOM but hidden
    const dialog = screen.queryByRole('dialog', { hidden: true })
    if (dialog) {
      expect(dialog).not.toBeVisible()
    } else {
      expect(dialog).toBeNull()
    }
  })

  it('dialog is visible when open=true', () => {
    renderDialog({ open: true })
    expect(
      screen.getByRole('dialog'),
    ).toBeVisible()
  })

  it('displays warning copy about permanent deletion', () => {
    renderDialog({ open: true })
    expect(
      screen.getByText(
        /permanently delete the tenant/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/cannot be undone/i),
    ).toBeInTheDocument()
  })
})
